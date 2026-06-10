const axios = require('axios');

// 天气缓存
let weatherCache = {
  data: null,
  lastUpdate: null
};

// 默认坐标（中国北京，可根据需要修改）
const DEFAULT_LATITUDE = 39.9042;
const DEFAULT_LONGITUDE = 116.4074;

// 天气代码映射到天气类型和图标
const weatherCodes = {
  0: { type: 'sunny', name: '晴天', icon: '☀️' },
  1: { type: 'sunny', name: '晴', icon: '🌤️' },
  2: { type: 'cloudy', name: '多云', icon: '⛅' },
  3: { type: 'cloudy', name: '阴', icon: '☁️' },
  45: { type: 'cloudy', name: '雾', icon: '🌫️' },
  48: { type: 'cloudy', name: '雾凇', icon: '🌫️' },
  51: { type: 'rainy', name: '小毛毛雨', icon: '🌧️' },
  53: { type: 'rainy', name: '中毛毛雨', icon: '🌧️' },
  55: { type: 'rainy', name: '大毛毛雨', icon: '🌧️' },
  61: { type: 'rainy', name: '小雨', icon: '🌧️' },
  63: { type: 'rainy', name: '中雨', icon: '🌧️' },
  65: { type: 'rainy', name: '大雨', icon: '🌧️' },
  71: { type: 'cloudy', name: '小雪', icon: '🌨️' },
  73: { type: 'cloudy', name: '中雪', icon: '🌨️' },
  75: { type: 'cloudy', name: '大雪', icon: '❄️' },
  77: { type: 'cloudy', name: '雪粒', icon: '🌨️' },
  80: { type: 'rainy', name: '小阵雨', icon: '🌧️' },
  81: { type: 'rainy', name: '中阵雨', icon: '🌧️' },
  82: { type: 'rainy', name: '大阵雨', icon: '⛈️' },
  85: { type: 'cloudy', name: '小阵雪', icon: '🌨️' },
  86: { type: 'cloudy', name: '大阵雪', icon: '❄️' },
  95: { type: 'rainy', name: '雷暴', icon: '⛈️' },
  96: { type: 'rainy', name: '雷暴+冰雹', icon: '⛈️' },
  99: { type: 'rainy', name: '雷暴+大冰雹', icon: '⛈️' }
};

// 获取默认天气信息
const getWeatherInfo = (weatherCode) => {
  return weatherCodes[weatherCode] || { type: 'unknown', name: '未知', icon: '❓' };
};

// 获取天气数据
const getWeather = async (latitude = DEFAULT_LATITUDE, longitude = DEFAULT_LONGITUDE) => {
  try {
    // 检查缓存是否有效（30分钟）
    if (weatherCache.data && weatherCache.lastUpdate) {
      const now = Date.now();
      const cacheAge = now - weatherCache.lastUpdate;
      if (cacheAge < 30 * 60 * 1000) { // 30分钟
        return weatherCache.data;
      }
    }

    // 调用 Open-Meteo API
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: latitude,
        longitude: longitude,
        current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
        timezone: 'Asia/Shanghai'
      },
      timeout: 10000
    });

    const current = response.data.current;
    const weatherInfo = getWeatherInfo(current.weather_code);

    const weatherData = {
      temperature: current.temperature_2m,
      weather_code: current.weather_code,
      weather_type: weatherInfo.type,
      weather_name: weatherInfo.name,
      weather_icon: weatherInfo.icon,
      wind_speed: current.wind_speed_10m,
      humidity: current.relative_humidity_2m,
      update_time: new Date().toISOString()
    };

    // 更新缓存
    weatherCache.data = weatherData;
    weatherCache.lastUpdate = Date.now();

    console.log(`天气数据已更新: ${weatherInfo.name}, 温度: ${current.temperature_2m}°C`);
    return weatherData;

  } catch (error) {
    console.error('获取天气数据失败:', error.message);
    
    // 如果有缓存数据，返回缓存
    if (weatherCache.data) {
      return weatherCache.data;
    }
    
    // 返回默认天气
    return {
      temperature: 20,
      weather_code: 0,
      weather_type: 'sunny',
      weather_name: '晴天',
      weather_icon: '☀️',
      wind_speed: 0,
      humidity: 50,
      update_time: new Date().toISOString()
    };
  }
};

// 获取愉悦度调整系数
const getHappinessMultiplier = (weatherType) => {
  switch (weatherType) {
    case 'sunny':
      return 1.5; // 晴天：愉悦度涨得快（1.5倍）
    case 'cloudy':
      return 1.0; // 阴天：正常速度
    case 'rainy':
      return 0.3; // 雨天：涨得慢（0.3倍），甚至下降
    default:
      return 1.0;
  }
};

// 获取愉悦度下降值（雨天时）
const getHappinessDrop = (weatherType) => {
  if (weatherType === 'rainy') {
    return 5; // 雨天抚摸时，愉悦度额外下降5点
  }
  return 0;
};

module.exports = {
  getWeather,
  getHappinessMultiplier,
  getHappinessDrop,
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE
};