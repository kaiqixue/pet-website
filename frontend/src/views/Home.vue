<template>
  <div class="app-container">
    <div class="header">
      <div class="header-left">
        <h1>🐕 狗狗养成</h1>
        <div class="weather-info" v-if="weather">
          <span class="weather-icon">{{ weather.weather_icon }}</span>
          <span class="weather-text">{{ weather.weather_name }} {{ weather.temperature }}°C</span>
        </div>
      </div>
      <div class="user-info">
        <span>欢迎, {{ username }}</span>
        <button class="logout-btn" @click="logout">退出登录</button>
      </div>
    </div>
    <div class="stats-sidebar">
      <StatsPanel ref="statsPanelRef" />
      <DiaryPanel ref="diaryPanelRef" />
    </div>
    <div class="main-content">
      <PetCard @action="handleAction" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PetCard from '../components/PetCard.vue'
import StatsPanel from '../components/StatsPanel.vue'
import DiaryPanel from '../components/DiaryPanel.vue'

const statsPanelRef = ref(null)
const diaryPanelRef = ref(null)
const username = ref('')
const weather = ref(null)

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  username.value = user.username || '用户'
  
  // 获取天气信息
  try {
    const response = await axios.get('/api/weather/current')
    weather.value = response.data
  } catch (error) {
    console.error('获取天气失败:', error)
  }
})

const handleAction = () => {
  if (statsPanelRef.value) {
    statsPanelRef.value.fetchHistory()
  }
  if (diaryPanelRef.value) {
    diaryPanelRef.value.refreshDiary()
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 14px;
}

.weather-icon {
  font-size: 20px;
}

.weather-text {
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 32px;
  padding: 100px 20px 20px;
  flex-wrap: wrap;
}

.stats-sidebar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-content {
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .app-container {
    flex-direction: column;
  }
  
  .stats-sidebar {
    order: 2;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .main-content {
    order: 1;
  }
}
</style>