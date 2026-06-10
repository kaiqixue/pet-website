require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, pool } = require('./config/db');
const petRoutes = require('./routes/petRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/pet', petRoutes);

app.get('/', (req, res) => {
  res.send('狗狗养成游戏后端API');
});

// 饥饿机制：每分钟减少状态
const startHungerTimer = () => {
  setInterval(async () => {
    try {
      await pool.execute(
        'UPDATE pet_stats SET hunger = GREATEST(hunger - 1, 0), happiness = GREATEST(happiness - 1, 0) WHERE id = (SELECT MAX(id) FROM (SELECT * FROM pet_stats) AS temp)'
      );
      console.log('状态已自动减少');
    } catch (error) {
      console.error('自动减少状态失败:', error);
    }
  }, 60000); // 每分钟执行一次
};

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    startHungerTimer();
    console.log('饥饿机制已启动');
  });
}).catch(err => {
  console.error('启动失败:', err);
  console.error('错误详情:', err.stack);
  process.exit(1);
});