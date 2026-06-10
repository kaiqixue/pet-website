const express = require('express');
const router = express.Router();
const { getPetStats, feedPet, petPet, resetPet, walkPet, getHistory, setPetName } = require('../controllers/petController');

router.get('/stats', getPetStats);
router.post('/feed', feedPet);
router.post('/pet', petPet);
router.post('/reset', resetPet);
router.post('/walk', walkPet);
router.get('/history', getHistory);
router.post('/name', setPetName);

module.exports = router;