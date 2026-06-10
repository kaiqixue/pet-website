const express = require('express');
const router = express.Router();
const { getPetStats, feedPet, petPet, resetPet, walkPet, getHistory, setPetName, changeSkin } = require('../controllers/petController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/stats', authenticateToken, getPetStats);
router.post('/feed', authenticateToken, feedPet);
router.post('/pet', authenticateToken, petPet);
router.post('/reset', authenticateToken, resetPet);
router.post('/walk', authenticateToken, walkPet);
router.get('/history', authenticateToken, getHistory);
router.post('/name', authenticateToken, setPetName);
router.post('/skin', authenticateToken, changeSkin);

module.exports = router;