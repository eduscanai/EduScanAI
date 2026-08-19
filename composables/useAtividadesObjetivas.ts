// Ações específicas de atividades do tipo "objetiva" — espelha 1:1 as de
// useSimulados.ts, mas batendo nas rotas de /api/atividades/[id]/objetiva/*
// (ver migration 036 e a decisão de manter prova objetiva como um tipo de
// atividade, não uma cópia de simulados/simulado_envios).

export interface QuestaoObjetiva {
  numero: number
  option_count: number
  resposta: string
  peso: number
}

interface PaginaNaoIdentificada {
  pagina: string
  motivo: string
  pagina_base64?: string
}

interface ResultadoLoteObjetiva {
  total_paginas: number
  aguardando_confirmacao: number
  envios: Array<{ id: string; aluno_id: string; nota: number | null; status_processamento: string }>
  nao_identificados: PaginaNaoIdentificada[]
}

export const useAtividadesObjetivas = () => {
  const { getSignedUrl } = useStorage()

  const createAtividadeObjetiva = async (payload: {
    titulo: string
    descricao?: string
    turma_ids: string[]
    disciplina_id?: string
    categoria_id?: string
    periodo_id?: string
    data_entrega?: string
    nota_maxima?: number
    peso?: number
    visivel_aluno?: boolean
    questoes: QuestaoObjetiva[]
    matricula_em_blocos?: boolean
  }) => {
    return await $fetch<any[]>('/api/atividades/objetivas', {
      method: 'POST',
      body: payload
    })
  }

  const escanearLoteObjetivo = async (atividadeId: string, arquivo: File) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    return await $fetch<ResultadoLoteObjetiva>(`/api/atividades/${atividadeId}/objetiva/escanear-lote`, {
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

  const escanearIndividualObjetivo = async (atividadeId: string, alunoId: string, arquivo: File) => {
    const form = new FormData()
    form.append('aluno_id', alunoId)
    form.append('arquivo', arquivo)
    return await $fetch(`/api/atividades/${atividadeId}/objetiva/escanear-individual`, {
      method: 'POST',
      body: form
    })
  }

  const atribuirEnvioObjetivoManual = async (
    atividadeId: string,
    alunoId: string,
    paginaBase64: string,
    nomeArquivo = 'folha.png'
  ) => {
    return await escanearIndividualObjetivo(atividadeId, alunoId, base64ParaArquivo(paginaBase64, nomeArquivo))
  }

  const confirmarEnvioObjetivo = async (atividadeId: string, envioId: string) => {
    return await $fetch(`/api/atividades/${atividadeId}/objetiva/envios/${envioId}/confirmar`, {
      method: 'POST'
    })
  }

  const rejeitarEnvioObjetivo = async (atividadeId: string, envioId: string) => {
    return await $fetch(`/api/atividades/${atividadeId}/objetiva/envios/${envioId}/rejeitar`, {
      method: 'POST'
    })
  }

  const confirmarPendentesObjetivos = async (atividadeId: string) => {
    return await $fetch<{ confirmados: number }>(
      `/api/atividades/${atividadeId}/objetiva/envios/confirmar-pendentes`,
      { method: 'POST' }
    )
  }

  const editarRespostasObjetivo = async (
    atividadeId: string,
    envioId: string,
    respostas: Record<string, string>
  ) => {
    return await $fetch(`/api/atividades/${atividadeId}/objetiva/envios/${envioId}/editar-respostas`, {
      method: 'POST',
      body: { respostas }
    })
  }

  const urlAssinadaObjetiva = async (caminho: string | null | undefined, bucket = 'assignments-files') => {
    if (!caminho) return null
    try {
      return await getSignedUrl(bucket, caminho)
    } catch {
      return null
    }
  }

  return {
    createAtividadeObjetiva,
    escanearLoteObjetivo,
    escanearIndividualObjetivo,
    atribuirEnvioObjetivoManual,
    confirmarEnvioObjetivo,
    rejeitarEnvioObjetivo,
    confirmarPendentesObjetivos,
    editarRespostasObjetivo,
    urlAssinadaObjetiva
  }
}
