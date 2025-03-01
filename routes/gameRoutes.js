import express from 'express';
import gameController from '../controllers/gameController.js';
import sessionMiddleware from '../middleware/sessionMiddleware.js';
const router = express.Router();



router.use(sessionMiddleware.protect);

router.post('/start', gameController.startGame);
// now after game is created, i do a get question api cancelIdleCallback, to get question with 1 or 2 clearTimeout, and option
router.get('/:gameId/next-question', gameController.getNextQuestion);
// router.post('/submit-answer', gameController.submitAnswer);

export default router;
