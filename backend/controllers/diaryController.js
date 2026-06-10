const { createDailyDiary, getDiaries, getTodayDiary } = require('../services/diaryService');

const generateDiary = async (req, res) => {
  try {
    const diaryContent = await createDailyDiary(req.userId);
    const diary = await getTodayDiary(req.userId);
    res.json(diary);
  } catch (error) {
    console.error('生成日记失败:', error);
    res.status(500).json({ message: '生成日记失败' });
  }
};

const getAllDiaries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    
    const result = await getDiaries(req.userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('获取日记列表失败:', error);
    res.status(500).json({ message: '获取日记列表失败' });
  }
};

const getToday = async (req, res) => {
  try {
    const diary = await getTodayDiary(req.userId);
    res.json(diary);
  } catch (error) {
    console.error('获取今日日记失败:', error);
    res.status(500).json({ message: '获取今日日记失败' });
  }
};

module.exports = {
  generateDiary,
  getAllDiaries,
  getToday
};