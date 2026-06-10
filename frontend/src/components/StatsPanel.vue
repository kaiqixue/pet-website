<template>
  <div class="stats-panel">
    <h3 class="panel-title">🐕 狗狗周报</h3>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'

Chart.register(...registerables)

const chartCanvas = ref(null)
let chartInstance = null

const historyData = ref([])

const fetchHistory = async () => {
  try {
    const response = await axios.get('/api/pet/history')
    historyData.value = response.data
    updateChart()
  } catch (error) {
    console.error('获取历史数据失败:', error)
  }
}

const updateChart = () => {
  if (!chartCanvas.value) return
  
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  const labels = historyData.value.map(item => {
    const date = new Date(item.recorded_at)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  
  const hungerData = historyData.value.map(item => item.hunger)
  const happinessData = historyData.value.map(item => item.happiness)
  const intimacyData = historyData.value.map(item => item.intimacy)
  
  const ctx = chartCanvas.value.getContext('2d')
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '饱食度',
          data: hungerData,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '愉悦度',
          data: happinessData,
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '亲密度',
          data: intimacyData,
          borderColor: '#FFE66D',
          backgroundColor: 'rgba(255, 230, 109, 0.1)',
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)'
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)'
          }
        }
      }
    }
  })
}

onMounted(() => {
  fetchHistory()
})

watch(historyData, () => {
  updateChart()
}, { deep: true })

defineExpose({ fetchHistory })
</script>

<style scoped>
.stats-panel {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  text-align: center;
}

.chart-container {
  height: 250px;
  width: 100%;
}
</style>