const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'

const register = async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' })
    }
    
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名已存在' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    )
    
    const userId = result.insertId
    
    await pool.query(
      'INSERT INTO pet_stats (user_id, hunger, happiness, intimacy) VALUES (?, ?, ?, ?)',
      [userId, 100, 100, 0]
    )
    
    res.status(201).json({ message: '注册成功' })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body
    
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }
    
    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' })
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

const getUser = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username FROM users WHERE id = ?',
      [req.userId]
    )
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    res.json(users[0])
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
}

module.exports = { register, login, getUser }