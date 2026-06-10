const { pool } = require('../config/db');
const { getWeather, getHappinessMultiplier, getHappinessDrop } = require('../services/weatherService');

const getPetStats = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    if (rows.length === 0) {
      await pool.execute('INSERT INTO pet_stats (user_id, hunger, happiness, intimacy) VALUES (?, 100, 100, 0)', [req.userId]);
      const [newRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
      return res.json(newRows[0]);
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: '获取宠物状态失败', error: error.message });
  }
};

const feedPet = async (req, res) => {
  try {
    const [currentRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    if (currentRows.length === 0) {
      await pool.execute('INSERT INTO pet_stats (user_id, hunger, happiness, intimacy) VALUES (?, 100, 100, 0)', [req.userId]);
      return getPetStats(req, res);
    }
    
    const before = {
      hunger: currentRows[0].hunger,
      happiness: currentRows[0].happiness,
      intimacy: currentRows[0].intimacy
    };
    
    await pool.execute(
      'UPDATE pet_stats SET hunger = LEAST(hunger + 20, 100) WHERE user_id = ?',
      [req.userId]
    );
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    const after = {
      hunger: updatedRows[0].hunger,
      happiness: updatedRows[0].happiness,
      intimacy: updatedRows[0].intimacy
    };
    
    await logAction(req.userId, 'feed', '喂食', before, after);
    await updateHistory(req.userId, updatedRows[0]);
    
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '喂食失败', error: error.message });
  }
};

const petPet = async (req, res) => {
  try {
    const [currentRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    if (currentRows.length === 0) {
      await pool.execute('INSERT INTO pet_stats (user_id, hunger, happiness, intimacy) VALUES (?, 100, 100, 0)', [req.userId]);
      return getPetStats(req, res);
    }
    
    const before = {
      hunger: currentRows[0].hunger,
      happiness: currentRows[0].happiness,
      intimacy: currentRows[0].intimacy
    };
    
    // 获取当前天气
    const weatherData = await getWeather();
    const multiplier = getHappinessMultiplier(weatherData.weather_type);
    const drop = getHappinessDrop(weatherData.weather_type);
    
    // 计算愉悦度变化：基础+15，乘以天气系数，再减去雨天下降值
    let happinessChange = Math.round(15 * multiplier);
    happinessChange = Math.max(happinessChange - drop, -10); // 雨天最多下降10点
    
    // 更新愉悦度和亲密度
    await pool.execute(
      `UPDATE pet_stats SET happiness = GREATEST(LEAST(happiness + ?, 100), 0), intimacy = LEAST(intimacy + 5, 100) WHERE user_id = ?`,
      [happinessChange, req.userId]
    );
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    const after = {
      hunger: updatedRows[0].hunger,
      happiness: updatedRows[0].happiness,
      intimacy: updatedRows[0].intimacy
    };
    
    await logAction(req.userId, 'pet', `抚摸 (${weatherData.weather_name})`, before, after);
    await updateHistory(req.userId, updatedRows[0]);
    
    res.json({
      ...updatedRows[0],
      weather: weatherData
    });
  } catch (error) {
    res.status(500).json({ message: '抚摸失败', error: error.message });
  }
};

const resetPet = async (req, res) => {
  try {
    await pool.execute(
      'UPDATE pet_stats SET hunger = 100, happiness = 100, intimacy = 0 WHERE user_id = ?',
      [req.userId]
    );
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '重置失败', error: error.message });
  }
};

const walkPet = async (req, res) => {
  try {
    const { type } = req.body;
    
    const [currentRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    if (currentRows.length === 0) {
      await pool.execute('INSERT INTO pet_stats (user_id, hunger, happiness, intimacy) VALUES (?, 100, 100, 0)', [req.userId]);
      return getPetStats(req, res);
    }
    
    const before = {
      hunger: currentRows[0].hunger,
      happiness: currentRows[0].happiness,
      intimacy: currentRows[0].intimacy
    };
    
    if (type === 'bone') {
      await pool.execute(
        'UPDATE pet_stats SET happiness = LEAST(happiness + 1, 100) WHERE user_id = ?',
        [req.userId]
      );
    } else if (type === 'friend') {
      await pool.execute(
        'UPDATE pet_stats SET intimacy = LEAST(intimacy + 10, 100) WHERE user_id = ?',
        [req.userId]
      );
    }
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    const after = {
      hunger: updatedRows[0].hunger,
      happiness: updatedRows[0].happiness,
      intimacy: updatedRows[0].intimacy
    };
    
    await logAction(req.userId, 'walk', type === 'bone' ? '散步 - 找到骨头' : (type === 'friend' ? '散步 - 交到朋友' : '散步'), before, after);
    await updateHistory(req.userId, updatedRows[0]);
    
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '散步失败', error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT hunger, happiness, intimacy, recorded_at FROM pet_history WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 7',
      [req.userId]
    );
    if (rows.length === 0) {
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        await pool.execute(
          'INSERT INTO pet_history (user_id, hunger, happiness, intimacy, recorded_at) VALUES (?, ?, ?, ?, ?)',
          [req.userId, 80 + Math.floor(Math.random() * 20), 75 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 50), dateStr]
        );
      }
      return getHistory(req, res);
    }
    res.json(rows.reverse());
  } catch (error) {
    res.status(500).json({ message: '获取历史数据失败', error: error.message });
  }
};

const updateHistory = async (userId, stats) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM pet_history WHERE user_id = ? AND recorded_at = ?',
      [userId, today]
    );
    
    if (rows[0].count > 0) {
      await pool.execute(
        'UPDATE pet_history SET hunger = ?, happiness = ?, intimacy = ? WHERE user_id = ? AND recorded_at = ?',
        [stats.hunger, stats.happiness, stats.intimacy, userId, today]
      );
    } else {
      await pool.execute(
        'INSERT INTO pet_history (user_id, hunger, happiness, intimacy, recorded_at) VALUES (?, ?, ?, ?, ?)',
        [userId, stats.hunger, stats.happiness, stats.intimacy, today]
      );
    }
  } catch (error) {
    console.error('更新历史记录失败:', error);
  }
};

const logAction = async (userId, actionType, actionName, before, after) => {
  try {
    await pool.execute(
      `INSERT INTO pet_logs (
        user_id, action_type, action_name,
        hunger_before, hunger_after,
        happiness_before, happiness_after,
        intimacy_before, intimacy_after
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
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
      'UPDATE pet_stats SET pet_name = ? WHERE user_id = ?',
      [name.trim(), req.userId]
    );
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '取名失败', error: error.message });
  }
};

const changeSkin = async (req, res) => {
  try {
    const { skin } = req.body;
    
    // 验证皮肤类型
    const validSkins = ['default', 'hat', 'cape'];
    if (!validSkins.includes(skin)) {
      return res.status(400).json({ message: '无效的皮肤类型' });
    }
    
    await pool.execute(
      'UPDATE pet_stats SET skin = ? WHERE user_id = ?',
      [skin, req.userId]
    );
    
    const [updatedRows] = await pool.execute('SELECT * FROM pet_stats WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ message: '切换皮肤失败', error: error.message });
  }
};

module.exports = { getPetStats, feedPet, petPet, resetPet, walkPet, getHistory, setPetName, changeSkin };