<template>
  <div class="w-full h-64">
    <canvas ref="graficoRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration
} from 'chart.js'

// Registrar componentes necessários do Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
)

export interface DadosGrafico {
  rotulos: string[]
  valores: number[]
}

export interface PropriedadesGraficoPerformance {
  dados: DadosGrafico
}

const props = defineProps<PropriedadesGraficoPerformance>()

const graficoRef = ref<HTMLCanvasElement | null>(null)
let graficoInstancia: Chart | null = null

const criarGrafico = () => {
  if (!graficoRef.value) return

  const ctx = graficoRef.value.getContext('2d')
  if (!ctx) return

  // Destruir gráfico anterior se existir
  if (graficoInstancia) {
    graficoInstancia.destroy()
  }

  const configuracao: ChartConfiguration = {
    type: 'line',
    data: {
      labels: props.dados.rotulos,
      datasets: [
        {
          label: 'Nota',
          data: props.dados.valores,
          borderColor: '#1132d4',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 200)
            gradient.addColorStop(0, 'rgba(17, 50, 212, 0.15)')
            gradient.addColorStop(1, 'rgba(17, 50, 212, 0)')
            return gradient
          },
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#1132d4',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointHoverBackgroundColor: '#1132d4',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#1a1a2e',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => {
              return `Nota: ${context.parsed.y.toFixed(1)}`
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2.5,
            color: '#9ca3af',
            font: {
              size: 11
            },
            callback: (value) => {
              return value.toFixed(1)
            }
          },
          border: {
            display: false
          },
          grid: {
            color: '#f1f3f5',
            lineWidth: 1
          }
        },
        x: {
          ticks: {
            color: '#9ca3af',
            font: {
              size: 11
            }
          },
          grid: {
            display: false
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  }

  graficoInstancia = new Chart(ctx, configuracao)
}

onMounted(() => {
  criarGrafico()
})

watch(
  () => props.dados,
  () => {
    criarGrafico()
  },
  { deep: true }
)
</script>
