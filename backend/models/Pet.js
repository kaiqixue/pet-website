const { pool } = require('../config/db');

class Pet {
  static async getStats() {
    try {
      const [rows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
      return rows[0];
    } catch (error) {
      throw new Error('获取宠物状态失败: ' + error.message);
    }
  }

  static async feed() {
    try {
      await pool.execute(
        'UPDATE pet_stats SET hunger = LEAST(hunger + 20, 100) WHERE id = (SELECT MAX(id) FROM pet_stats)'
      );
      const [rows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
      return rows[0];
    } catch (error) {
      throw new Error('喂食失败: ' + error.message);
    }
  }

  static async pet() {
    try {
      await pool.execute(
        'UPDATE pet_stats SET happiness = LEAST(happiness + 15, 100), intimacy = LEAST(intimacy + 5, 100) WHERE id = (SELECT MAX(id) FROM pet_stats)'
      );
      const [rows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
      return rows[0];
    } catch (error) {
      throw new Error('抚摸失败: ' + error.message);
    }
  }

  static async reset() {
    try {
      await pool.execute(
        'UPDATE pet_stats SET hunger = 100, happiness = 100, intimacy = 0 WHERE id = (SELECT MAX(id) FROM pet_stats)'
      );
      const [rows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
      return rows[0];
    } catch (error) {
      throw new Error('重置失败: ' + error.message);
    }
  }
}

module.exports = Pet;