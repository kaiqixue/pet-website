const express = require('express');
const router = express.Router();
const { generateDiary, getAllDiaries, getToday } = require('../controllers/diaryController');

router.post('/generate', generateDiary);
router.get('/', getAllDiaries);
router.get('/today', getToday);

module.exports = router;