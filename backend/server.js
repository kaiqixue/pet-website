require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, pool } = require('./config/db');
const petRoutes = require('./routes/petRoutes');
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const diaryRoutes = require('./routes/diaryRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pet', petRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/diary', diaryRoutes);

app.get('/', (req, res) => {
  res.send('狗狗养成游戏后端API');
});

const startHungerTimer = () => {
  setInterval(async () => {
    try {
      await pool.execute(
        'UPDATE pet_stats SET hunger = GREATEST(hunger - 1, 0), happiness = GREATEST(happiness - 1, 0)'
      );
      console.log('状态已自动减少');
    } catch (error) {
      console.error('自动减少状态失败:', error);
    }
  }, 60000);
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