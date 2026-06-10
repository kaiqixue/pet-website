const { pool } = require('../config/db');

// 日记生成器
const generateDiaryContent = (stats, feedCount, petCount, weatherType) => {
  const { hunger_avg, happiness_avg, intimacy_avg } = stats;
  const diaries = [];
  
  // 根据饱食度生成内容
  if (hunger_avg >= 80) {
    diaries.push('今天吃得饱饱的，肚子圆滚滚的，好幸福呀！🍖');
    diaries.push('主人喂了好多好吃的，我都吃撑了，趴在窝里不想动~');
    diaries.push('肚子好满足，舔了舔嘴唇，觉得自己是世界上最幸福的狗狗！');
  } else if (hunger_avg >= 50) {
    diaries.push('今天吃了个七分饱，肚子暖暖的，很舒服。');
    diaries.push('吃了一点东西，但还是有点意犹未尽呢...');
    diaries.push('虽然没有大餐，但有小零食也不错呀~');
  } else {
    diaries.push('肚子有点空空的感觉，好想再吃点东西...');
    diaries.push('好饿呀！看着主人的食物好眼馋，可是主人不给我吃...');
    diaries.push('今天的饭不够多，希望明天能多吃点！');
  }
  
  // 根据愉悦度生成内容
  if (happiness_avg >= 80) {
    diaries.push('今天心情超级好！看到什么都想摇尾巴！');
    diaries.push('主人陪了我一整天，太开心啦，尾巴都快摇断了！');
    diaries.push('今天是最快乐的一天！我在家里蹦蹦跳跳的，太开心了！');
  } else if (happiness_avg >= 50) {
    diaries.push('今天还不错，有开心的时候也有无聊的时候。');
    diaries.push('虽然有点无聊，但总体来说还是挺好的。');
    diaries.push('今天过得很平淡，不过有主人在就很安心。');
  } else {
    diaries.push('今天有点闷闷不乐，好想让主人多陪陪我...');
    diaries.push('感觉有点无聊呢，主人是不是太忙了？');
    diaries.push('今天有点不开心，好想出去玩呀！');
  }
  
  // 根据亲密度生成内容
  if (intimacy_avg >= 80) {
    diaries.push('和主人的感情越来越好了，我们是最好的朋友！');
    diaries.push('主人好温柔呀，我好爱好爱主人！');
    diaries.push('我们之间有特别的默契，一个眼神就知道对方在想什么~');
  } else if (intimacy_avg >= 50) {
    diaries.push('和主人相处得还不错，感情在慢慢升温~');
    diaries.push('我喜欢和主人在一起，感觉很安心。');
    diaries.push('主人对我很好，我也想努力讨好主人！');
  } else {
    diaries.push('希望主人能多陪陪我，我们还可以更亲密的！');
    diaries.push('好想和主人建立更深的感情呀，我会努力的！');
    diaries.push('虽然现在还不够亲近，但我觉得会越来越好的！');
  }
  
  // 根据喂食次数生成内容
  if (feedCount >= 5) {
    diaries.push('今天被喂了好多次！主人对我太好了！');
    diaries.push('零食不断的一天，我都吃胖了！');
  } else if (feedCount >= 3) {
    diaries.push('今天吃了几顿饭，营养均衡，很健康~');
  } else if (feedCount === 0) {
    diaries.push('今天好像没有吃东西呢，明天一定要告诉主人我很饿！');
  }
  
  // 根据抚摸次数生成内容
  if (petCount >= 5) {
    diaries.push('今天被主人摸了好多次，舒服得都不想动了~');
    diaries.push('主人的手好温暖，摸得我都要睡着了！');
  } else if (petCount >= 3) {
    diaries.push('今天有被主人摸摸，开心！');
    diaries.push('被抚摸的感觉真好，希望明天还能有更多~');
  } else if (petCount === 0) {
    diaries.push('今天好像没有被摸呢，有点小失落...');
    diaries.push('好想要主人摸摸头呀！');
  }
  
  // 根据天气生成内容
  if (weatherType === 'sunny') {
    diaries.push('今天阳光明媚，在窗边晒太阳好舒服呀！');
    diaries.push('阳光照在身上暖洋洋的，好幸福~');
  } else if (weatherType === 'rainy') {
    diaries.push('外面下雨了，只能待在家里，有点无聊呢...');
    diaries.push('听着雨声发呆，好想出去玩呀！');
  } else {
    diaries.push('今天天气不错，虽然不是晴天，但也挺好的~');
    diaries.push('阴阴的天，有点安静，但还是喜欢和主人待在一起。');
  }
  
  // 随机选择3-5条组成日记
  const shuffled = diaries.sort(() => 0.5 - Math.random());
  const count = Math.min(Math.floor(Math.random() * 3) + 3, shuffled.length);
  
  return shuffled.slice(0, count).join('\n\n');
};

// 生成日记
const createDailyDiary = async (userId, date = null) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // 获取当天的统计数据
    const [logs] = await pool.execute(
      `SELECT action_type, COUNT(*) as count 
       FROM pet_logs 
       WHERE user_id = ? AND DATE(created_at) = ? 
       GROUP BY action_type`,
      [userId, targetDate]
    );
    
    const feedCount = logs.find(l => l.action_type === 'feed')?.count || 0;
    const petCount = logs.find(l => l.action_type === 'pet')?.count || 0;
    
    // 获取当天最后一次的宠物状态
    const [stats] = await pool.execute(
      `SELECT hunger, happiness, intimacy 
       FROM pet_stats 
       WHERE user_id = ? 
       ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );
    
    const petStats = stats[0] || { hunger: 100, happiness: 100, intimacy: 0 };
    
    // 获取当天的平均状态
    const [avgStats] = await pool.execute(
      `SELECT 
        COALESCE(AVG(happiness_after), ?) as happiness_avg,
        COALESCE(AVG(hunger_after), ?) as hunger_avg,
        COALESCE(AVG(intimacy_after), ?) as intimacy_avg
       FROM pet_logs 
       WHERE user_id = ? AND DATE(created_at) = ?`,
      [petStats.happiness, petStats.hunger, petStats.intimacy, userId, targetDate]
    );
    
    const avgStatsResult = avgStats[0] || {
      hunger_avg: petStats.hunger,
      happiness_avg: petStats.happiness,
      intimacy_avg: petStats.intimacy
    };
    
    // 获取天气信息
    const weatherService = require('./weatherService');
    const weather = await weatherService.getWeather();
    
    // 生成日记内容
    const diaryContent = generateDiaryContent(
      {
        hunger_avg: Math.round(avgStatsResult.hunger_avg),
        happiness_avg: Math.round(avgStatsResult.happiness_avg),
        intimacy_avg: Math.round(avgStatsResult.intimacy_avg)
      },
      feedCount,
      petCount,
      weather.weather_type
    );
    
    // 保存日记
    await pool.execute(
      `INSERT INTO pet_diaries 
       (user_id, diary_date, diary_content, hunger_avg, happiness_avg, intimacy_avg, feed_count, pet_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       diary_content = VALUES(diary_content),
       hunger_avg = VALUES(hunger_avg),
       happiness_avg = VALUES(happiness_avg),
       intimacy_avg = VALUES(intimacy_avg),
       feed_count = VALUES(feed_count),
       pet_count = VALUES(pet_count)`,
      [
        userId,
        targetDate,
        diaryContent,
        Math.round(avgStatsResult.hunger_avg),
        Math.round(avgStatsResult.happiness_avg),
        Math.round(avgStatsResult.intimacy_avg),
        feedCount,
        petCount
      ]
    );
    
    console.log(`用户 ${userId} 的 ${targetDate} 日记已生成`);
    return diaryContent;
  } catch (error) {
    console.error('生成日记失败:', error);
    throw error;
  }
};

// 获取日记列表
const getDiaries = async (userId, page = 1, limit = 7) => {
  try {
    const offset = (page - 1) * limit;
    
    const [diaries] = await pool.execute(
      `SELECT id, diary_date, diary_content, hunger_avg, happiness_avg, intimacy_avg, 
              feed_count, pet_count, created_at
       FROM pet_diaries 
       WHERE user_id = ?
       ORDER BY diary_date DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) as total FROM pet_diaries WHERE user_id = ?',
      [userId]
    );
    
    return {
      diaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('获取日记失败:', error);
    throw error;
  }
};

// 获取今天的日记
const getTodayDiary = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [diaries] = await pool.execute(
      `SELECT * FROM pet_diaries WHERE user_id = ? AND diary_date = ?`,
      [userId, today]
    );
    
    if (diaries.length > 0) {
      return diaries[0];
    }
    
    // 如果今天的日记不存在，生成一个
    const content = await createDailyDiary(userId, today);
    return {
      diary_date: today,
      diary_content: content,
      hunger_avg: 0,
      happiness_avg: 0,
      intimacy_avg: 0,
      feed_count: 0,
      pet_count: 0
    };
  } catch (error) {
    console.error('获取今天的日记失败:', error);
    throw error;
  }
};

module.exports = {
  createDailyDiary,
  getDiaries,
  getTodayDiary,
  generateDiaryContent
};