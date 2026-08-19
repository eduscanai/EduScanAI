// Cliente HTTP para o microserviço Python de correção OMR (ver /service no
// repo omrchecker). O serviço é "cego": não conhece escola/turma/aluno, só
// gera/corrige folhas. Toda a modelagem de negócio fica aqui, no Nitro.

interface QuestaoOMR {
  numero: number
  option_count: number
  resposta: string
  peso: number
}

interface AlunoParaFolha {
  aluno_id: string
  nome?: string
  matricula?: string
}

interface GerarGabaritoParams {
  titulo: string
  identificador?: string
  matriculaEmBlocos: boolean
  questoes: QuestaoOMR[]
  alunos?: AlunoParaFolha[]
  turma?: string
}

interface ArquivosGerados {
  template_json: Record<string, unknown>
  config_json: Record<string, unknown>
  marcador_base64: string
  folha_respostas_base64: string
  folha_solucao_base64: string
}

export interface FolhaAlunoGerada {
  aluno_id: string
  folha_base64: string
}

interface GerarGabaritoResultado {
  gabarito: Record<string, string>
  pesos: Record<string, number>
  arquivos: ArquivosGerados
  folhas_alunos: FolhaAlunoGerada[]
  folha_completa_base64: string | null
}

const authHeaders = (): Record<string, string> => {
  const config = useRuntimeConfig()
  return config.omrServiceToken
    ? { Authorization: `Bearer ${config.omrServiceToken}` }
    : {}
}

export const gerarGabaritoOMR = async (
  params: GerarGabaritoParams
): Promise<GerarGabaritoResultado> => {
  const config = useRuntimeConfig()

  return await $fetch<GerarGabaritoResultado>('/v1/gabarito/gerar', {
    baseURL: config.omrServiceUrl,
    method: 'POST',
    headers: authHeaders(),
    body: {
      titulo: params.titulo,
      identificador: params.identificador || '',
      matricula_em_blocos: params.matriculaEmBlocos,
      questoes: params.questoes,
      alunos: params.alunos || [],
      turma: params.turma || ''
    }
  })
}

interface DividirFolhaResultado {
  paginas: Array<{ nome: string; conteudo_base64: string }>
}

export const dividirFolhaOMR = async (
  nomeArquivo: string,
  conteudo: Buffer,
  tipoConteudo: string
): Promise<DividirFolhaResultado> => {
  const config = useRuntimeConfig()

  const form = new FormData()
  form.append(
    'arquivo',
    new Blob([new Uint8Array(conteudo)], { type: tipoConteudo }),
    nomeArquivo
  )

  return await $fetch<DividirFolhaResultado>('/v1/folha/dividir', {
    baseURL: config.omrServiceUrl,
    method: 'POST',
    headers: authHeaders(),
    body: form
  })
}

interface CorrigirFolhaParams {
  sheetBuffer: Buffer
  sheetFilename: string
  sheetContentType: string
  templateJson: Record<string, unknown>
  configJson: Record<string, unknown>
  markerBuffer: Buffer
  matriculaEmBlocos: boolean
  gabarito?: {
    questoes: QuestaoOMR[]
    valorMaximo: number
  }
}

interface DetalheQuestaoOMR {
  questao: number
  selecionada: string
  resposta_correta: string
  correta: boolean
  em_branco: boolean
  peso: number
  valor_questao: number
  pontos_obtidos: number
}

interface NotaOMR {
  acertos: number
  erros: number
  em_branco: number
  total: number
  nota: number
  nota_maxima: number
  percentual: number
  peso_ganho: number
  peso_total: number
  detalhes: DetalheQuestaoOMR[]
}

interface MatriculaOMR {
  valor: string
  digitos: string[]
  ink_ratios: number[]
  gap_invalido: boolean
}

export interface QRDetectadoOMR {
  simulado_id: string
  aluno_id: string
}

export interface CorrigirFolhaResultado {
  respostas_detectadas: Record<string, string>
  matricula: MatriculaOMR | null
  qr: QRDetectadoOMR | null
  nota: NotaOMR | null
  imagem_processada_base64: string | null
  log_excerto: string
}

export const corrigirFolhaOMR = async (
  params: CorrigirFolhaParams
): Promise<CorrigirFolhaResultado> => {
  const config = useRuntimeConfig()

  const form = new FormData()
  form.append(
    'sheet',
    new Blob([new Uint8Array(params.sheetBuffer)], { type: params.sheetContentType }),
    params.sheetFilename
  )
  form.append(
    'template',
    new Blob([JSON.stringify(params.templateJson)], {
      type: 'application/json'
    }),
    'template.json'
  )
  form.append(
    'config',
    new Blob([JSON.stringify(params.configJson)], {
      type: 'application/json'
    }),
    'config.json'
  )
  form.append(
    'marker',
    new Blob([new Uint8Array(params.markerBuffer)], { type: 'image/jpeg' }),
    'marker.jpg'
  )
  form.append('matricula_em_blocos', String(params.matriculaEmBlocos))

  if (params.gabarito) {
    form.append(
      'gabarito_json',
      JSON.stringify({
        questoes: params.gabarito.questoes,
        valor_maximo: params.gabarito.valorMaximo
      })
    )
  }

  return await $fetch<CorrigirFolhaResultado>('/v1/folha/corrigir', {
    baseURL: config.omrServiceUrl,
    method: 'POST',
    headers: authHeaders(),
    body: form
  })
}
