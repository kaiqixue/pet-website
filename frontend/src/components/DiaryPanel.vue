<template>
  <div class="diary-panel">
    <div class="diary-header">
      <h3>📔 狗狗日记</h3>
      <button class="refresh-btn" @click="refreshDiary" title="刷新日记">🔄</button>
    </div>
    
    <div class="diary-content">
      <div class="diary-date">
        {{ currentDiary?.diary_date ? formatDate(currentDiary.diary_date) : '今日' }}
      </div>
      <div class="diary-text" v-if="currentDiary">
        <p v-for="(line, index) in diaryLines" :key="index">{{ line }}</p>
      </div>
      <div class="diary-loading" v-else-if="loading">
        正在加载日记...
      </div>
      <div class="diary-empty" v-else>
        今天还没有日记哦，快去和狗狗互动吧！
      </div>
    </div>
    
    <div class="diary-stats" v-if="currentDiary">
      <div class="stat-item" title="喂食次数">
        🍖 {{ currentDiary.feed_count }}次
      </div>
      <div class="stat-item" title="抚摸次数">
        🤚 {{ currentDiary.pet_count }}次
      </div>
    </div>
    
    <button class="history-btn" @click="showHistory = true">
      📜 查看历史日记
    </button>
    
    <!-- 历史日记弹窗 -->
    <div class="history-modal" v-if="showHistory" @click.self="showHistory = false">
      <div class="history-content">
        <div class="history-header">
          <h3>📜 历史日记</h3>
          <button class="close-btn" @click="showHistory = false">✕</button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="diary in diaries" 
            :key="diary.id" 
            class="history-item"
          >
            <div class="history-date">{{ formatDate(diary.diary_date) }}</div>
            <div class="history-text">
              <p v-for="(line, idx) in diary.diary_content.split('\n\n')" :key="idx">
                {{ line }}
              </p>
            </div>
            <div class="history-stats">
              <span>🍖 {{ diary.feed_count }}次</span>
              <span>🤚 {{ diary.pet_count }}次</span>
            </div>
          </div>
        </div>
        
        <div class="pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage <= 1"
            class="page-btn"
          >
            ◀ 上一页
          </button>
          <span class="page-info">
            第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <button 
            @click="nextPage" 
            :disabled="currentPage >= totalPages"
            class="page-btn"
          >
            下一页 ▶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const currentDiary = ref(null)
const diaries = ref([])
const loading = ref(false)
const showHistory = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const diaryLines = computed(() => {
  if (!currentDiary.value?.diary_content) return []
  return currentDiary.value.diary_content.split('\n\n')
})

const fetchTodayDiary = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/diary/today')
    currentDiary.value = response.data
  } catch (error) {
    console.error('获取今日日记失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchHistory = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/diary', {
      params: {
        page: currentPage.value,
        limit: 7
      }
    })
    diaries.value = response.data.diaries
    totalPages.value = response.data.pagination.totalPages
  } catch (error) {
    console.error('获取历史日记失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshDiary = async () => {
  try {
    await axios.post('/api/diary/generate')
    await fetchTodayDiary()
  } catch (error) {
    console.error('刷新日记失败:', error)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchHistory()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchHistory()
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.getTime() === today.getTime()) {
    return '今天'
  } else if (date.getTime() === yesterday.getTime()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

const openHistory = () => {
  showHistory.value = true
  fetchHistory()
}

onMounted(() => {
  fetchTodayDiary()
})

defineExpose({
  refreshDiary,
  openHistory
})
</script>

<style scoped>
.diary-panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 350px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.diary-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.refresh-btn {
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: #e0e0e0;
  transform: rotate(180deg);
}

.diary-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.diary-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
}

.diary-text {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  line-height: 1.8;
}

.diary-text p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #444;
}

.diary-text p:last-child {
  margin-bottom: 0;
}

.diary-loading,
.diary-empty {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
}

.diary-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat-item {
  font-size: 14px;
  color: #666;
}

.history-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: transform 0.2s;
}

.history-btn:hover {
  transform: translateY(-2px);
}

/* 历史日记弹窗 */
.history-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.history-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.history-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.history-item {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-date {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 12px;
}

.history-text {
  margin-bottom: 12px;
}

.history-text p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.history-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.page-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #764ba2;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}
</style>
