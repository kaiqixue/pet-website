<template>
  <div class="app-container">
    <div class="stats-sidebar">
      <StatsPanel ref="statsPanelRef" />
    </div>
    <div class="main-content">
      <PetCard @action="handleAction" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PetCard from './components/PetCard.vue'
import StatsPanel from './components/StatsPanel.vue'

const statsPanelRef = ref(null)

const handleAction = () => {
  if (statsPanelRef.value) {
    statsPanelRef.value.fetchHistory()
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 32px;
  padding: 20px;
  flex-wrap: wrap;
}

.stats-sidebar {
  flex-shrink: 0;
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
  }
  
  .main-content {
    order: 1;
  }
}
</style>