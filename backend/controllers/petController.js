const { pool } = require('../config/db');

const getPetStats = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: '宠物数据未找到' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: '获取宠物状态失败', error: error.message });
  }
};

const feedPet = async (req, res) => {
  try {
    const [currentRows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    const before = {
      hunger: currentRows[0].hunger,
      happiness: currentRows[0].happiness,
      intimacy: currentRows[0].intimacy
    };
    
    await pool.execute(
      'UPDATE pet_stats SET hunger = LEAST(hunger + 20, 100) WHERE id = (SELECT MAX(id) FROM (SELECT * FROM pet_stats) AS temp)'
    );
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    const after = {
      hunger: updatedRows[0].hunger,
      happiness: updatedRows[0].happiness,
      intimacy: updatedRows[0].intimacy
    };
    
    // 记录操作
    await logAction('feed', '喂食', before, after);
    // 更新历史记录
    await updateHistory(updatedRows[0]);
    
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '喂食失败', error: error.message });
  }
};

const petPet = async (req, res) => {
  try {
    const [currentRows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    const before = {
      hunger: currentRows[0].hunger,
      happiness: currentRows[0].happiness,
      intimacy: currentRows[0].intimacy
    };
    
    await pool.execute(
      'UPDATE pet_stats SET happiness = LEAST(happiness + 15, 100), intimacy = LEAST(intimacy + 5, 100) WHERE id = (SELECT MAX(id) FROM (SELECT * FROM pet_stats) AS temp)'
    );
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    const after = {
      hunger: updatedRows[0].hunger,
      happiness: updatedRows[0].happiness,
      intimacy: updatedRows[0].intimacy
    };
    
    // 记录操作
    await logAction('pet', '抚摸', before, after);
    // 更新历史记录
    await updateHistory(updatedRows[0]);
    
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '抚摸失败', error: error.message });
  }
};

const resetPet = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'UPDATE pet_stats SET hunger = 100, happiness = 100, intimacy = 0 WHERE id = (SELECT MAX(id) FROM (SELECT * FROM pet_stats) AS temp)'
    );
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '重置失败', error: error.message });
  }
};

const walkPet = async (req, res) => {
  try {
    const { type } = req.body;
    
    const [currentRows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    const before = {
      hunger: currentRows[0].hunger,
      happiness: currentRows[0].happiness,
      intimacy: currentRows[0].intimacy
    };
    
    if (type === 'bone') {
      // 找到骨头，愉悦度 +1
      await pool.execute(
        'UPDATE pet_stats SET happiness = LEAST(happiness + 1, 100) WHERE id = (SELECT MAX(id) FROM (SELECT * FROM pet_stats) AS temp)'
      );
    } else if (type === 'friend') {
      // 交到新朋友，亲密度 +10
      await pool.execute(
        'UPDATE pet_stats SET intimacy = LEAST(intimacy + 10, 100) WHERE id = (SELECT MAX(id) FROM (SELECT * FROM pet_stats) AS temp)'
      );
    }
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    const after = {
      hunger: updatedRows[0].hunger,
      happiness: updatedRows[0].happiness,
      intimacy: updatedRows[0].intimacy
    };
    
    // 记录操作
    await logAction('walk', type === 'bone' ? '散步 - 找到骨头' : (type === 'friend' ? '散步 - 交到朋友' : '散步'), before, after);
    // 更新历史记录
    await updateHistory(updatedRows[0]);
    
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '散步失败', error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT hunger, happiness, intimacy, recorded_at FROM pet_history ORDER BY recorded_at DESC LIMIT 7'
    );
    res.json(rows.reverse());
  } catch (error) {
    res.status(500).json({ message: '获取历史数据失败', error: error.message });
  }
};

const updateHistory = async (stats) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM pet_history WHERE recorded_at = ?',
      [today]
    );
    
    if (rows[0].count > 0) {
      await pool.execute(
        'UPDATE pet_history SET hunger = ?, happiness = ?, intimacy = ? WHERE recorded_at = ?',
        [stats.hunger, stats.happiness, stats.intimacy, today]
      );
    } else {
      await pool.execute(
        'INSERT INTO pet_history (hunger, happiness, intimacy, recorded_at) VALUES (?, ?, ?, ?)',
        [stats.hunger, stats.happiness, stats.intimacy, today]
      );
    }
  } catch (error) {
    console.error('更新历史记录失败:', error);
  }
};

const updateHistoryAfterAction = async () => {
  try {
    const [rows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    if (rows.length > 0) {
      await updateHistory(rows[0]);
    }
  } catch (error) {
    console.error('更新历史记录失败:', error);
  }
};

const logAction = async (actionType, actionName, before, after) => {
  try {
    await pool.execute(
      `INSERT INTO pet_logs (
        action_type, action_name,
        hunger_before, hunger_after,
        happiness_before, happiness_after,
        intimacy_before, intimacy_after
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actionType,
        actionName,
        before.hunger,
        after.hunger,
        before.happiness,
        after.happiness,
        before.intimacy,
        after.intimacy
      ]
    );
  } catch (error) {
    console.error('记录操作失败:', error);
  }
};

const setPetName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: '名字不能为空' });
    }
    
    await pool.execute(
      'UPDATE pet_stats SET pet_name = ? WHERE id = (SELECT MAX(id) FROM (SELECT * FROM pet_stats) AS temp)',
      [name.trim()]
    );
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats ORDER BY id DESC LIMIT 1');
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '取名失败', error: error.message });
  }
};

module.exports = { getPetStats, feedPet, petPet, resetPet, walkPet, getHistory, updateHistoryAfterAction, setPetName };