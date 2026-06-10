<template>
  <div class="pet-card">
    <!-- 取名区域 -->
    <div class="name-section">
      <div class="name-display">
        <span class="name-label">狗狗名字：</span>
        <span class="name-value">{{ petName }}</span>
      </div>
      <div class="name-input-section">
        <input 
          v-model="newName" 
          type="text" 
          placeholder="输入新名字" 
          class="name-input"
          maxlength="10"
        />
        <button class="name-btn" @click="setName" :disabled="isLoading || !newName.trim()">
          取名
        </button>
      </div>
    </div>
    
    <div class="pet-display">
      <div class="bubble" :class="{ 'show': showBubble }">汪汪！谢谢主人！</div>
      <div class="pet-emoji" :class="{ 'animate-bounce': isAnimating, 'animate-blink': isBlinking }">
        {{ dogEmoji }}
      </div>
      <!-- 心情留言 -->
      <div class="mood-message">
        <div class="mood-bubble">{{ moodMessage }}</div>
      </div>
      <div class="pet-mood">{{ moodText }}</div>
    </div>
    
    <div class="status-section">
      <StatusBar label="饱食度" :value="stats.hunger" color="#FF6B6B" />
      <StatusBar label="愉悦度" :value="stats.happiness" color="#4ECDC4" />
      <StatusBar label="亲密度" :value="stats.intimacy" color="#FFE66D" />
    </div>
    
    <div class="action-section">
      <button class="action-btn feed-btn" @click="feed" :disabled="isLoading">
        <span class="btn-icon">🍖</span>
        <span class="btn-text">喂食</span>
      </button>
      <button class="action-btn pet-btn" @click="pet" :disabled="isLoading">
        <span class="btn-icon">✋</span>
        <span class="btn-text">抚摸</span>
      </button>
      <button class="action-btn walk-btn" @click="walk" :disabled="isLoading">
        <span class="btn-icon">🚶</span>
        <span class="btn-text">遛狗</span>
      </button>
    </div>
    
    <div class="walk-message" :class="{ 'show': showWalkMessage }">
      {{ walkMessage }}
    </div>
    
    <button class="reset-btn" @click="reset" :disabled="isLoading">
      重置状态
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import StatusBar from './StatusBar.vue'

const emit = defineEmits(['action'])

const stats = ref({
  hunger: 100,
  happiness: 100,
  intimacy: 0
})

const isLoading = ref(false)
const isAnimating = ref(false)
const isBlinking = ref(false)
const showBubble = ref(false)
const showWalkMessage = ref(false)
const walkMessage = ref('')
const petName = ref('小狗狗')
const newName = ref('')

// 心情留言相关
const moodMessages = {
  highHunger: [
    '吃得好饱，开心！',
    '肚子鼓鼓的，好满足~',
    '主人对我真好！'
  ],
  highHappiness: [
    '今天好开心呀！',
    '尾巴摇得停不下来~',
    '最喜欢和主人玩了！'
  ],
  normal: [
    '主人，我想出去散步',
    '有点无聊呢...',
    '主人陪我玩嘛~'
  ],
  low: [
    '有点饿，也有点无聊',
    '主人，我需要关爱...',
    '今天不太开心...'
  ]
}

const getRandomMessage = (messages) => {
  return messages[Math.floor(Math.random() * messages.length)]
}

const moodMessage = computed(() => {
  const hunger = stats.value.hunger
  const happiness = stats.value.happiness
  
  if (hunger >= 80) {
    return getRandomMessage(moodMessages.highHunger)
  } else if (happiness >= 80) {
    return getRandomMessage(moodMessages.highHappiness)
  } else if (hunger >= 50 && happiness >= 50) {
    return getRandomMessage(moodMessages.normal)
  } else {
    return getRandomMessage(moodMessages.low)
  }
})

const dogEmoji = computed(() => {
  const avg = (stats.value.hunger + stats.value.happiness) / 2
  if (avg >= 80) return '🐕'
  if (avg >= 50) return '🐶'
  return '😢'
})

const moodText = computed(() => {
  const avg = (stats.value.hunger + stats.value.happiness) / 2
  if (avg >= 80) return '开心'
  if (avg >= 50) return '一般'
  return '难过'
})

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/pet/stats')
    stats.value = {
      hunger: response.data.hunger,
      happiness: response.data.happiness,
      intimacy: response.data.intimacy
    }
    // 获取狗狗名字
    if (response.data.pet_name) {
      petName.value = response.data.pet_name
    }
  } catch (error) {
    console.error('获取状态失败:', error)
  }
}

const setName = async () => {
  if (!newName.value.trim()) return
  isLoading.value = true
  
  try {
    const response = await axios.post('/api/pet/name', { name: newName.value })
    petName.value = response.data.pet_name
    newName.value = ''
    emit('action')
  } catch (error) {
    console.error('取名失败:', error)
  }
  
  isLoading.value = false
}

const feed = async () => {
  if (isLoading.value) return
  isLoading.value = true
  isAnimating.value = true
  
  // 显示眨眼动画
  isBlinking.value = true
  setTimeout(() => {
    isBlinking.value = false
  }, 500)
  
  // 显示气泡对话框
  showBubble.value = true
  setTimeout(() => {
    showBubble.value = false
  }, 3000)
  
  try {
    const response = await axios.post('/api/pet/feed')
    stats.value = {
      hunger: response.data.hunger,
      happiness: response.data.happiness,
      intimacy: response.data.intimacy
    }
    emit('action')
  } catch (error) {
    console.error('喂食失败:', error)
  }
  
  setTimeout(() => {
    isAnimating.value = false
    isLoading.value = false
  }, 500)
}

const pet = async () => {
  if (isLoading.value) return
  isLoading.value = true
  isAnimating.value = true
  
  try {
    const response = await axios.post('/api/pet/pet')
    stats.value = {
      hunger: response.data.hunger,
      happiness: response.data.happiness,
      intimacy: response.data.intimacy
    }
    emit('action')
  } catch (error) {
    console.error('抚摸失败:', error)
  }
  
  setTimeout(() => {
    isAnimating.value = false
    isLoading.value = false
  }, 500)
}

const reset = async () => {
  if (isLoading.value) return
  if (!confirm('确定要重置宠物状态吗？')) return
  
  isLoading.value = true
  try {
    const response = await axios.post('/api/pet/reset')
    stats.value = {
      hunger: response.data.hunger,
      happiness: response.data.happiness,
      intimacy: response.data.intimacy
    }
    emit('action')
  } catch (error) {
    console.error('重置失败:', error)
  }
  isLoading.value = false
}

const walk = async () => {
  if (isLoading.value) return
  isLoading.value = true
  isAnimating.value = true
  
  // 显示散步中提示
  showWalkMessage.value = true
  walkMessage.value = '散步中…… 🐕🚶'
  
  // 散步持续3秒
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // 随机触发彩蛋事件（三种结果概率均等）
  const random = Math.random()
  let result = ''
  
  if (random < 0.33) {
    // 找到一块骨头，愉悦度+1
    result = '🦴 找到一块骨头！愉悦度+1'
    try {
      await axios.post('/api/pet/walk', { type: 'bone' })
      const response = await axios.get('/api/pet/stats')
      stats.value = {
        hunger: response.data.hunger,
        happiness: response.data.happiness,
        intimacy: response.data.intimacy
      }
      emit('action')
    } catch (error) {
      console.error('散步失败:', error)
    }
  } else if (random < 0.66) {
    // 交到一只新朋友，亲密度+10
    result = '🐾 交到一只新朋友！亲密度+10'
    try {
      await axios.post('/api/pet/walk', { type: 'friend' })
      const response = await axios.get('/api/pet/stats')
      stats.value = {
        hunger: response.data.hunger,
        happiness: response.data.happiness,
        intimacy: response.data.intimacy
      }
      emit('action')
    } catch (error) {
      console.error('散步失败:', error)
    }
  } else {
    // 什么也没发生
    result = '🌿 今天很安静'
    emit('action')
  }
  
  // 显示结果
  walkMessage.value = result
  
  // 3秒后隐藏消息
  setTimeout(() => {
    showWalkMessage.value = false
    walkMessage.value = ''
    isAnimating.value = false
    isLoading.value = false
  }, 3000)
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.pet-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pet-display {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}

.bubble {
  position: absolute;
  top: -60px;
  right: 20px;
  background: white;
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(10px) scale(0.8);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}

.bubble.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.pet-emoji {
  font-size: 80px;
  margin-bottom: 12px;
  display: inline-block;
}

.pet-emoji.animate-bounce {
  animation: bounce 0.5s ease-in-out;
}

.pet-emoji.animate-blink {
  animation: blink 0.5s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes blink {
  0%, 30%, 70%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.pet-name {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.pet-mood {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #fff;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feed-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
}

.feed-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
}

.pet-btn {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
}

.pet-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(78, 205, 196, 0.4);
}

.walk-btn {
  background: linear-gradient(135deg, #95E1D3 0%, #7BC47F 100%);
}

.walk-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(149, 225, 211, 0.4);
}

.btn-icon {
  font-size: 28px;
}

.btn-text {
  font-size: 14px;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.walk-message {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.walk-message.show {
  opacity: 1;
  transform: translateY(0);
}

/* 取名区域样式 */
.name-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.name-display {
  text-align: center;
  margin-bottom: 12px;
}

.name-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.name-value {
  font-size: 18px;
  font-weight: 700;
  color: #FFE66D;
  margin-left: 8px;
}

.name-input-section {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.name-input {
  flex: 1;
  max-width: 180px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.name-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.name-input:focus {
  border-color: #FFE66D;
  background: rgba(255, 255, 255, 0.15);
}

.name-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #FFE66D 0%, #FFA500 100%);
  color: #333;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.name-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 230, 109, 0.4);
}

.name-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 心情留言样式 */
.mood-message {
  margin: 16px 0;
  display: flex;
  justify-content: center;
}

.mood-bubble {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  max-width: 200px;
  text-align: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mood-bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid rgba(255, 255, 255, 0.9);
}
</style>