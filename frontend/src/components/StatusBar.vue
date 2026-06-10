<template>
  <div class="status-bar-container">
    <div class="status-item">
      <div class="status-icon">🍖</div>
      <div class="status-info">
        <span class="status-label">{{ label }}</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: value + '%', backgroundColor: color }"
          ></div>
        </div>
        <span class="status-value">{{ value }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: '#4CAF50'
  }
})
</script>

<style scoped>
.status-bar-container {
  width: 100%;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.status-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.status-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}
</style>