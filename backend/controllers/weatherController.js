const { getWeather, DEFAULT_LATITUDE, DEFAULT_LONGITUDE } = require('../services/weatherService');

const getCurrentWeather = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    const weatherData = await getWeather(
      latitude ? parseFloat(latitude) : DEFAULT_LATITUDE,
      longitude ? parseFloat(longitude) : DEFAULT_LONGITUDE
    );
    
    res.json(weatherData);
  } catch (error) {
    console.error('获取天气失败:', error);
    res.status(500).json({ message: '获取天气数据失败' });
  }
};

module.exports = {
  getCurrentWeather
};