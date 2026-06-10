require('dotenv').config();
const mysql = require('mysql2/promise');

const addSkinField = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pet_db',
  });

  try {
    console.log('开始添加 skin 字段...');
    
    // 添加 skin 字段到 pet_stats 表
    try {
      await pool.execute(
        "ALTER TABLE pet_stats ADD COLUMN skin VARCHAR(20) NOT NULL DEFAULT 'default' COMMENT '皮肤：default/hat/cape'"
      );
      console.log('✓ 已添加 skin 字段到 pet_stats 表');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ skin 字段已存在');
      } else {
        throw error;
      }
    }
    
    console.log('数据库更新完成!');
    process.exit(0);
  } catch (error) {
    console.error('更新数据库失败:', error);
    process.exit(1);
  }
};

addSkinField();