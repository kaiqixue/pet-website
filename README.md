# 狗狗养成互动游戏

一个基于Vue3 + Node.js + MySQL的狗狗养成互动网页游戏。

## 项目结构

```
petweb/
├── backend/                 # Node.js后端
│   ├── config/             # 配置文件
│   │   └── db.js          # 数据库配置
│   ├── controllers/       # 控制器
│   │   └── petController.js
│   ├── models/           # 数据模型
│   │   └── Pet.js
│   ├── routes/           # 路由
│   │   └── petRoutes.js
│   ├── .env             # 环境变量
│   ├── .env.example     # 环境变量示例
│   ├── .gitignore       # Git忽略文件
│   ├── package.json     # 依赖配置
│   └── server.js        # 服务器入口
├── frontend/            # Vue3前端
│   ├── public/         # 公共资源
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── PetCard.vue
│   │   │   └── StatusBar.vue
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vite.svg
└── init.sql            # 数据库初始化脚本
```

## 功能特性

- 🐕 **狗狗展示**：根据状态显示不同表情（开心/一般/难过）
- 📊 **三种状态**：饱食度、愉悦度、亲密度（带进度条显示）
- 🍖 **喂食按钮**：点击增加饱食度+20（上限100）
- ✋ **抚摸按钮**：点击增加愉悦度+15、亲密度+5（上限100）
- 💾 **数据持久化**：自动保存到MySQL数据库

## 技术栈

### 前端
- Vue 3.4.21
- Vite 5.1.0
- Axios 1.6.5

### 后端
- Node.js
- Express 4.18.2
- MySQL2 3.9.0
- CORS 2.8.5
- Dotenv 16.3.1

### 数据库
- MySQL 8.0+
- 字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci

## 安装与运行

### 前置要求
- Node.js 16+
- MySQL 8.0+

### 1. 数据库配置

```bash
# 在MySQL中执行初始化脚本
mysql -u root -p < init.sql
```

### 2. 后端配置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置数据库密码等配置

# 启动开发服务器
npm run dev

# 或启动生产服务器
npm start
```

后端服务运行在 http://localhost:3001

### 3. 前端配置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

前端页面运行在 http://localhost:5173

## API接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/pet/stats` | GET | 获取宠物状态 |
| `/api/pet/feed` | POST | 喂食（增加饱食度） |
| `/api/pet/pet` | POST | 抚摸（增加愉悦度和亲密度） |
| `/api/pet/reset` | POST | 重置状态 |

## 环境变量配置

在 `backend/.env` 文件中配置：

```env
# 服务器配置
PORT=3001

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=pet_db

# 数据库连接池配置
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
```

## 开发说明

### 前端开发
- 使用Vite作为开发服务器，支持热更新
- API请求通过Vite代理转发到后端
- 组件化开发，状态管理使用Vue 3 Composition API

### 后端开发
- 使用Express框架
- MVC架构模式
- 支持环境变量配置
- 自动数据库初始化

## 许可证

MIT License