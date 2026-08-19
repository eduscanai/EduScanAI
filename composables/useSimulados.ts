export interface QuestaoSimulado {
  numero: number
  option_count: number
  resposta: string
  peso: number
}

export interface Simulado {
  id: string
  escola_id: string
  turma_id: string
  professor_id: string
  titulo: string
  questoes: QuestaoSimulado[]
  gabarito: Record<string, string>
  pesos: Record<string, number>
  valor_maximo: number
  matricula_em_blocos: boolean
  status: 'rascunho' | 'publicado' | 'encerrado'
  marcador_url: string | null
  folha_respostas_url: string | null
  folha_solucao_url: string | null
  criado_em: string
  atualizado_em: string
  turmas?: { name: string }
  perfis?: { full_name: string }
}

export interface SimuladoEnvio {
  id: string
  simulado_id: string
  aluno_id: string
  status_processamento: 'pendente' | 'processando' | 'aguardando_confirmacao' | 'corrigido' | 'erro'
  arquivo_original_url: string | null
  matricula_detectada: string | null
  imagem_processada_url: string | null
  respostas_detectadas: Record<string, string> | null
  nota: number | null
  percentual: number | null
  acertos: number | null
  erros: number | null
  em_branco: number | null
  detalhes: unknown
  log_excerto: string | null
  corrigido_em: string | null
  criado_em: string
  perfis?: { full_name: string; matricula: string | null }
}

interface PaginaNaoIdentificada {
  pagina: string
  motivo: string
  pagina_base64?: string
}

interface ResultadoLote {
  total_paginas: number
  aguardando_confirmacao: number
  envios: Array<{ id: string; aluno_id: string; nota: number | null; status_processamento: string }>
  nao_identificados: PaginaNaoIdentificada[]
}

const SELECT_SIMULADO = '*, turmas(name), perfis!professor_id(full_name)'

export const useSimulados = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useUsuario()
  const { isTeacher, isStudent } = usePermissions()
  const { getSignedUrl } = useStorage()

  const simulados = ref<Simulado[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getTeacherClassIds = async (): Promise<string[]> => {
    if (!usuario.value.id) return []
    const { data } = await supabase
      .from('turma_professores')
      .select('class_id')
      .eq('teacher_id', usuario.value.id)
    return data?.map((c: any) => c.class_id) || []
  }

  const listSimulados = async (turmaId?: string) => {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('simulados')
        .select(SELECT_SIMULADO)
        .order('criado_em', { ascending: false })

      if (turmaId) {
        query = query.eq('turma_id', turmaId)
      } else if (isTeacher.value) {
        const classIds = await getTeacherClassIds()
        if (classIds.length === 0) {
          simulados.value = []
          return
        }
        query = query.in('turma_id', classIds)
      } else if (isStudent.value) {
        query = query.eq('escola_id', usuario.value.schoolId).eq('status', 'publicado')
      } else {
        query = query.eq('escola_id', usuario.value.schoolId)
      }

      const { data, error: err } = await query
      if (err) throw err
      simulados.value = (data || []) as Simulado[]
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const getSimulado = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('simulados')
        .select(SELECT_SIMULADO)
        .eq('id', id)
        .single()
      if (err) throw err
      return data as Simulado
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  const listEnvios = async (simuladoId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('simulado_envios')
        .select('*, perfis(full_name, matricula)')
        .eq('simulado_id', simuladoId)
      if (err) throw err
      return (data || []) as SimuladoEnvio[]
    } catch (e: any) {
      error.value = e.message
      return []
    }
  }

  const createSimulado = async (payload: {
    titulo: string
    turma_id: string
    questoes: Array<{ numero?: number; option_count: number; resposta: string; peso?: number }>
    matricula_em_blocos?: boolean
    valor_maximo?: number
  }) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<Simulado>('/api/simulados', {
        method: 'POST',
        body: payload
      })
    } catch (e: any) {
      error.value = e?.data?.message || e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteSimulado = async (id: string) => {
    const { error: err } = await supabase.from('simulados').delete().eq('id', id)
    if (err) throw err
  }

  const enviarLote = async (simuladoId: string, arquivo: File) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    return await $fetch<ResultadoLote>(`/api/simulados/${simuladoId}/envios/lote`, {
      method: 'POST',
      body: form
    })
  }

  const base64ParaArquivo = (base64: string, nome: string, tipo = 'image/png') => {
    const binario = atob(base64)
    const bytes = new Uint8Array(binario.length)
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
    return new File([bytes], nome, { type: tipo })
  }

  const atribuirEnvioManual = async (
    simuladoId: string,
    alunoId: string,
    paginaBase64: string,
    nomeArquivo = 'folha.png'
  ) => {
    const form = new FormData()
    form.append('aluno_id', alunoId)
    form.append('arquivo', base64ParaArquivo(paginaBase64, nomeArquivo))
    return await $fetch<SimuladoEnvio>(`/api/simulados/${simuladoId}/envios/individual`, {
      method: 'POST',
      body: form
    })
  }

  const enviarIndividual = async (simuladoId: string, alunoId: string, arquivo: File) => {
    const form = new FormData()
    form.append('aluno_id', alunoId)
    form.append('arquivo', arquivo)
    return await $fetch<SimuladoEnvio>(`/api/simulados/${simuladoId}/envios/individual`, {
      method: 'POST',
      body: form
    })
  }

  const urlAssinada = async (caminho: string | null | undefined) => {
    if (!caminho) return null
    try {
      return await getSignedUrl('simulados-files', caminho)
    } catch {
      return null
    }
  }

  const confirmarEnvio = async (simuladoId: string, envioId: string) => {
    return await $fetch<SimuladoEnvio>(
      `/api/simulados/${simuladoId}/envios/${envioId}/confirmar`,
      { method: 'POST' }
    )
  }

  const rejeitarEnvio = async (simuladoId: string, envioId: string) => {
    return await $fetch(`/api/simulados/${simuladoId}/envios/${envioId}/rejeitar`, {
      method: 'POST'
    })
  }

  const confirmarPendentes = async (simuladoId: string) => {
    return await $fetch<{ confirmados: number }>(
      `/api/simulados/${simuladoId}/envios/confirmar-pendentes`,
      { method: 'POST' }
    )
  }

  const editarRespostas = async (
    simuladoId: string,
    envioId: string,
    respostas: Record<string, string>
  ) => {
    return await $fetch<SimuladoEnvio>(
      `/api/simulados/${simuladoId}/envios/${envioId}/editar-respostas`,
      { method: 'POST', body: { respostas } }
    )
  }

  return {
    simulados,
    loading,
    error,
    listSimulados,
    getSimulado,
    listEnvios,
    createSimulado,
    deleteSimulado,
    enviarLote,
    enviarIndividual,
    atribuirEnvioManual,
    urlAssinada,
    confirmarEnvio,
    rejeitarEnvio,
    confirmarPendentes,
    editarRespostas
  }
}
