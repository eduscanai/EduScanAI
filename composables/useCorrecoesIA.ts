interface CorrecaoIA {
  id: string
  envio_id: string
  nota_geral: number
  total_questoes: number
  acertos: number
  resumo_ia: string | null
  resposta_raw: any
  modelo_ia: string
  processado_em: string
}

interface DesempenhoTopico {
  id: string
  correcao_id: string
  topico_id: string
  acertos: number
  total: number
  percentual: number
  nivel: 'facil' | 'medio' | 'dificil'
  observacao_ia: string | null
  topicos_atividade?: { nome: string; descricao: string | null }
}

interface CorrecaoCompleta extends CorrecaoIA {
  desempenhos: DesempenhoTopico[]
}

export const useCorrecoesIA = () => {
  const supabase = useSupabaseClient()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Buscar correção de um envio específico
  const getCorrecao = async (envioId: string): Promise<CorrecaoCompleta | null> => {
    loading.value = true
    error.value = null
    try {
      const { data: correcao, error: err } = await supabase
        .from('correcoes_ia')
        .select('*')
        .eq('envio_id', envioId)
        .maybeSingle()
      if (err) throw err
      if (!correcao) return null

      const { data: desempenhos, error: err2 } = await supabase
        .from('desempenho_topico')
        .select('*, topicos_atividade(nome, descricao)')
        .eq('correcao_id', correcao.id)
        .order('percentual', { ascending: true })
      if (err2) throw err2

      return {
        ...(correcao as CorrecaoIA),
        desempenhos: (desempenhos || []) as DesempenhoTopico[]
      }
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Buscar todas as correções de uma atividade (para professor)
  const getCorrecoesAtividade = async (atividadeId: string): Promise<(CorrecaoIA & { envio: any })[]> => {
    loading.value = true
    error.value = null
    try {
      // Buscar envios da atividade
      const { data: envios, error: err1 } = await supabase
        .from('envios')
        .select('id, aluno_id, status_processamento, perfis(full_name)')
        .eq('atividade_id', atividadeId)
      if (err1) throw err1
      if (!envios || envios.length === 0) return []

      const envioIds = envios.map((e: any) => e.id)

      const { data: correcoes, error: err2 } = await supabase
        .from('correcoes_ia')
        .select('*')
        .in('envio_id', envioIds)
      if (err2) throw err2

      const envioMap = new Map(envios.map((e: any) => [e.id, e]))
      return (correcoes || []).map((c: any) => ({
        ...c,
        envio: envioMap.get(c.envio_id)
      })) as (CorrecaoIA & { envio: any })[]
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Resultados agregados por tópico para uma atividade
  const getResultadosPorTopico = async (atividadeId: string) => {
    loading.value = true
    error.value = null
    try {
      // Buscar tópicos
      const { data: topicos, error: err1 } = await supabase
        .from('topicos_atividade')
        .select('id, nome')
        .eq('atividade_id', atividadeId)
      if (err1) throw err1
      if (!topicos || topicos.length === 0) return []

      // Buscar envios com correções
      const { data: envios } = await supabase
        .from('envios')
        .select('id')
        .eq('atividade_id', atividadeId)
        .eq('status_processamento', 'corrigido')
      if (!envios || envios.length === 0) return topicos.map((t: any) => ({ ...t, mediaPercentual: 0, totalAlunos: 0 }))

      const envioIds = envios.map((e: any) => e.id)

      const { data: correcoes } = await supabase
        .from('correcoes_ia')
        .select('id')
        .in('envio_id', envioIds)
      if (!correcoes || correcoes.length === 0) return topicos.map((t: any) => ({ ...t, mediaPercentual: 0, totalAlunos: 0 }))

      const correcaoIds = correcoes.map((c: any) => c.id)

      const { data: desempenhos } = await supabase
        .from('desempenho_topico')
        .select('topico_id, percentual')
        .in('correcao_id', correcaoIds)

      // Agregar por tópico
      const topicoMap = new Map<string, number[]>()
      ;(desempenhos || []).forEach((d: any) => {
        const arr = topicoMap.get(d.topico_id) || []
        arr.push(d.percentual)
        topicoMap.set(d.topico_id, arr)
      })

      return topicos.map((t: any) => {
        const vals = topicoMap.get(t.id) || []
        const media = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
        return {
          id: t.id,
          nome: t.nome,
          mediaPercentual: Math.round(media * 10) / 10,
          totalAlunos: vals.length
        }
      })
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Disparar correção via API
  const dispararCorrecao = async (envioId: string) => {
    try {
      await $fetch('/api/corrigir', {
        method: 'POST',
        body: { envio_id: envioId }
      })
    } catch (e: any) {
      console.error('Erro ao disparar correção:', e.message)
    }
  }

  return {
    loading, error,
    getCorrecao, getCorrecoesAtividade, getResultadosPorTopico, dispararCorrecao
  }
}
