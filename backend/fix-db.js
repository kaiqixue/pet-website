require('dotenv').config();
const mysql = require('mysql2/promise');

const fixDatabase = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pet_db',
  });

  try {
    console.log('开始修复数据库表结构...');
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
      username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
      password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    try {
      await pool.execute('ALTER TABLE pet_stats ADD COLUMN user_id INT NOT NULL DEFAULT 1 COMMENT \'用户ID\'');
      console.log('已添加 user_id 字段到 pet_stats 表');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('user_id 字段已存在');
      } else {
        console.log('添加 user_id 字段失败:', error.message);
      }
    }
    
    try {
      await pool.execute('ALTER TABLE pet_history ADD COLUMN user_id INT NOT NULL DEFAULT 1 COMMENT \'用户ID\'');
      console.log('已添加 user_id 字段到 pet_history 表');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('user_id 字段已存在');
      } else {
        console.log('添加 user_id 字段失败:', error.message);
      }
    }
    
    try {
      await pool.execute('ALTER TABLE pet_logs ADD COLUMN user_id INT NOT NULL DEFAULT 1 COMMENT \'用户ID\'');
      console.log('已添加 user_id 字段到 pet_logs 表');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('user_id 字段已存在');
      } else {
        console.log('添加 user_id 字段失败:', error.message);
      }
    }
    
    console.log('数据库修复完成!');
    process.exit(0);
  } catch (error) {
    console.error('修复数据库失败:', error);
    process.exit(1);
  }
};

fixDatabase();