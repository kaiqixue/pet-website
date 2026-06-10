require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pet_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0
});

const initDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS pet_db 
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS pet_stats (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
      hunger INT NOT NULL DEFAULT 100 COMMENT '饱食度',
      happiness INT NOT NULL DEFAULT 100 COMMENT '愉悦度',
      intimacy INT NOT NULL DEFAULT 0 COMMENT '亲密度',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    // 检查是否存在pet_name字段，如果不存在则添加
    try {
      await pool.execute('ALTER TABLE pet_stats ADD COLUMN pet_name VARCHAR(50) DEFAULT \'小狗狗\' COMMENT \'狗狗名字\'');
    } catch (error) {
      // 如果字段已存在，会报错，忽略这个错误
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS pet_history (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
      hunger INT NOT NULL COMMENT '饱食度',
      happiness INT NOT NULL COMMENT '愉悦度',
      intimacy INT NOT NULL COMMENT '亲密度',
      recorded_at DATE NOT NULL COMMENT '记录日期'
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS pet_logs (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
      action_type VARCHAR(20) NOT NULL COMMENT '操作类型：feed/pet/walk',
      action_name VARCHAR(50) NOT NULL COMMENT '操作名称',
      hunger_before INT NOT NULL COMMENT '操作前饱食度',
      hunger_after INT NOT NULL COMMENT '操作后饱食度',
      happiness_before INT NOT NULL COMMENT '操作前愉悦度',
      happiness_after INT NOT NULL COMMENT '操作后愉悦度',
      intimacy_before INT NOT NULL COMMENT '操作前亲密度',
      intimacy_after INT NOT NULL COMMENT '操作后亲密度',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM pet_stats');
    if (rows[0].count === 0) {
      await pool.execute('INSERT INTO pet_stats (hunger, happiness, intimacy) VALUES (100, 100, 0)');
    }
    
    // 初始化历史数据（如果没有数据的话）
    const [historyRows] = await pool.execute('SELECT COUNT(*) as count FROM pet_history');
    if (historyRows[0].count === 0) {
      // 创建过去7天的模拟数据
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        await pool.execute(
          'INSERT INTO pet_history (hunger, happiness, intimacy, recorded_at) VALUES (?, ?, ?, ?)',
          [80 + Math.floor(Math.random() * 20), 75 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 50), dateStr]
        );
      }
    }
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};

module.exports = { pool, initDatabase };