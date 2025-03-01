import express from 'express';
import userResponseController from '../controllers/userResponseController.js';
import sessionMiddleware from '../middleware/sessionMiddleware.js';
const router = express.Router();



router.use(sessionMiddleware.protect);
// router.use(sessionMiddleware.protect); for game session
router.post('/', userResponseController.submitAnswer);
// now after game is created, i do a get question api cancelIdleCallback, to get question with 1 or 2 clearTimeout, and option
// router.get('/:gameId/next-question', gameController.getNextQuestion);
// router.post('/submit-answer', gameController.submitAnswer);

export default router;
