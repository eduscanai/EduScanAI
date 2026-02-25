interface ArquivoUpload {
  name: string
  url: string
  path: string
  size: number
  type: string
}

interface UploadOptions {
  bucket: string
  folder?: string
  onProgress?: (percent: number) => void
}

const EXTENSOES_PERMITIDAS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'mp4', 'mp3', 'zip', 'txt', 'csv'
]

const TAMANHO_MAXIMO = 50 * 1024 * 1024 // 50MB

export const useStorage = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()
  const user = useSupabaseUser()

  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  const validarArquivo = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !EXTENSOES_PERMITIDAS.includes(ext)) {
      return `Formato não permitido: .${ext}. Use: ${EXTENSOES_PERMITIDAS.join(', ')}`
    }
    if (file.size > TAMANHO_MAXIMO) {
      return `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 50MB`
    }
    return null
  }

  const gerarCaminho = (bucket: string, folder: string | undefined, fileName: string) => {
    const ext = fileName.split('.').pop()
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const nomeArquivo = `${timestamp}_${random}.${ext}`

    const schoolId = usuario.value.schoolId
    const userId = user.value?.id

    // submissions-files: school_id/student_id/folder/arquivo
    if (bucket === 'submissions-files') {
      return folder
        ? `${schoolId}/${userId}/${folder}/${nomeArquivo}`
        : `${schoolId}/${userId}/${nomeArquivo}`
    }

    // assignments-files e school-assets: school_id/folder/arquivo
    return folder
      ? `${schoolId}/${folder}/${nomeArquivo}`
      : `${schoolId}/${nomeArquivo}`
  }

  const uploadFile = async (file: File, options: UploadOptions): Promise<ArquivoUpload> => {
    error.value = null

    const validacao = validarArquivo(file)
    if (validacao) {
      error.value = validacao
      throw new Error(validacao)
    }

    const { bucket, folder, onProgress } = options
    const path = gerarCaminho(bucket, folder, file.name)

    uploading.value = true
    progress.value = 0

    try {
      // Upload com XHR para ter progresso
      const url = await uploadComProgresso(bucket, path, file, (percent) => {
        progress.value = percent
        onProgress?.(percent)
      })

      return {
        name: file.name,
        url,
        path,
        size: file.size,
        type: file.type
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao enviar arquivo'
      throw e
    } finally {
      uploading.value = false
    }
  }

  const uploadComProgresso = (bucket: string, path: string, file: File, onProgress: (p: number) => void): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      // Usar o SDK do Supabase para upload (mais simples e confiável)
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        reject(uploadError)
        return
      }

      onProgress(100)

      // Obter URL
      const urlResult = getFileUrl(bucket, path)
      resolve(urlResult)
    })
  }

  const getFileUrl = (bucket: string, path: string): string => {
    // Buckets públicos: getPublicUrl
    if (bucket === 'assignments-files' || bucket === 'school-assets') {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    }

    // Buckets privados: signed URL (1h)
    return `signed:${bucket}:${path}`
  }

  const getSignedUrl = async (bucket: string, path: string, expiresIn = 3600): Promise<string> => {
    const { data, error: err } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (err) throw err
    return data.signedUrl
  }

  const deleteFile = async (bucket: string, path: string) => {
    const { error: err } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (err) throw err
  }

  const deleteFiles = async (bucket: string, paths: string[]) => {
    if (paths.length === 0) return
    const { error: err } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (err) throw err
  }

  return {
    uploading,
    progress,
    error,
    validarArquivo,
    uploadFile,
    getFileUrl,
    getSignedUrl,
    deleteFile,
    deleteFiles,
    EXTENSOES_PERMITIDAS,
    TAMANHO_MAXIMO
  }
}
