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
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
      username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
      password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS pet_stats (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
      user_id INT NOT NULL COMMENT '用户ID',
      hunger INT NOT NULL DEFAULT 100 COMMENT '饱食度',
      happiness INT NOT NULL DEFAULT 100 COMMENT '愉悦度',
      intimacy INT NOT NULL DEFAULT 0 COMMENT '亲密度',
      pet_name VARCHAR(50) DEFAULT '小狗狗' COMMENT '狗狗名字',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    try {
      await pool.execute('ALTER TABLE pet_stats ADD COLUMN user_id INT NOT NULL DEFAULT 1 COMMENT \'用户ID\'');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('user_id字段已存在或添加失败:', error.message);
      }
    }
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS pet_history (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
      user_id INT NOT NULL COMMENT '用户ID',
      hunger INT NOT NULL COMMENT '饱食度',
      happiness INT NOT NULL COMMENT '愉悦度',
      intimacy INT NOT NULL COMMENT '亲密度',
      recorded_at DATE NOT NULL COMMENT '记录日期',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS pet_logs (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
      user_id INT NOT NULL COMMENT '用户ID',
      action_type VARCHAR(20) NOT NULL COMMENT '操作类型：feed/pet/walk',
      action_name VARCHAR(50) NOT NULL COMMENT '操作名称',
      hunger_before INT NOT NULL COMMENT '操作前饱食度',
      hunger_after INT NOT NULL COMMENT '操作后饱食度',
      happiness_before INT NOT NULL COMMENT '操作前愉悦度',
      happiness_after INT NOT NULL COMMENT '操作后愉悦度',
      intimacy_before INT NOT NULL COMMENT '操作前亲密度',
      intimacy_after INT NOT NULL COMMENT '操作后亲密度',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS pet_diaries (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
      user_id INT NOT NULL COMMENT '用户ID',
      diary_date DATE NOT NULL COMMENT '日记日期',
      diary_content TEXT NOT NULL COMMENT '日记内容',
      hunger_avg INT NOT NULL DEFAULT 0 COMMENT '当天平均饱食度',
      happiness_avg INT NOT NULL DEFAULT 0 COMMENT '当天平均愉悦度',
      intimacy_avg INT NOT NULL DEFAULT 0 COMMENT '当天平均亲密度',
      feed_count INT NOT NULL DEFAULT 0 COMMENT '当天喂食次数',
      pet_count INT NOT NULL DEFAULT 0 COMMENT '当天抚摸次数',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      UNIQUE KEY unique_user_date (user_id, diary_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};

module.exports = { pool, initDatabase };