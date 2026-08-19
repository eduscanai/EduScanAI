// Recalcula a nota a partir de um mapa de respostas (q1..qN -> letra), pra
// quando o professor edita manualmente uma resposta detectada por engano
// antes de confirmar o envio. Mesma matemática de grade_responses no
// microserviço Python (service/app/grading.py) — não chama o serviço de
// volta porque isso é só aritmética sobre dados já em mãos, sem OMR nenhum.

interface QuestaoOMR {
  numero: number
  option_count: number
  resposta: string
  peso: number
}

interface DetalheQuestao {
  questao: number
  selecionada: string
  resposta_correta: string
  correta: boolean
  em_branco: boolean
  peso: number
  valor_questao: number
  pontos_obtidos: number
}

export interface NotaRecalculada {
  acertos: number
  erros: number
  em_branco: number
  total: number
  nota: number
  nota_maxima: number
  percentual: number
  peso_ganho: number
  peso_total: number
  detalhes: DetalheQuestao[]
}

const arredondar = (valor: number, casas: number) => {
  const fator = 10 ** casas
  return Math.round(valor * fator) / fator
}

export const recalcularNota = (
  respostas: Record<string, string>,
  questoes: QuestaoOMR[],
  valorMaximo: number
): NotaRecalculada => {
  const questaoPorNumero = new Map(questoes.map((q) => [q.numero, q]))
  const numeros = questoes.map((q) => q.numero).sort((a, b) => a - b)

  const pesos = new Map<number, number>()
  for (const numero of numeros) {
    const peso = questaoPorNumero.get(numero)?.peso ?? 1
    pesos.set(numero, peso > 0 ? peso : 1)
  }
  const pesoTotal = [...pesos.values()].reduce((soma, peso) => soma + peso, 0) || numeros.length || 1

  let acertos = 0
  let emBranco = 0
  let pesoGanho = 0
  const detalhes: DetalheQuestao[] = []

  for (const numero of numeros) {
    const respostaCorreta = questaoPorNumero.get(numero)?.resposta || ''
    const selecionada = respostas[`q${numero}`] || ''
    const isBranco = selecionada === ''
    const isCorreta = !!respostaCorreta && selecionada === respostaCorreta
    const peso = pesos.get(numero) || 1
    const valorQuestao = (valorMaximo * peso) / pesoTotal
    const pontosObtidos = isCorreta ? valorQuestao : 0

    if (isCorreta) {
      acertos += 1
      pesoGanho += peso
    }
    if (isBranco) emBranco += 1

    detalhes.push({
      questao: numero,
      selecionada,
      resposta_correta: respostaCorreta,
      correta: isCorreta,
      em_branco: isBranco,
      peso: arredondar(peso, 6),
      valor_questao: arredondar(valorQuestao, 4),
      pontos_obtidos: arredondar(pontosObtidos, 4)
    })
  }

  const total = numeros.length
  const fracaoPeso = pesoTotal ? pesoGanho / pesoTotal : 0

  return {
    acertos,
    erros: total - acertos,
    em_branco: emBranco,
    total,
    nota: arredondar(valorMaximo * fracaoPeso, 4),
    nota_maxima: arredondar(valorMaximo, 4),
    percentual: arredondar(fracaoPeso * 100, 2),
    peso_ganho: arredondar(pesoGanho, 6),
    peso_total: arredondar(pesoTotal, 6),
    detalhes
  }
}
