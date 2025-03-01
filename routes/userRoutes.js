import express from 'express';
import userController from '../controllers/userController.js';
import sessionMiddleware from '../middleware/sessionMiddleware.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);


router.use(sessionMiddleware.protect);
router.get('/me', userController.getProfile);

// router.get(
//   '/total-score',
//   userController.getMe,
//   userController.getUserScore
// );
  
// router.get(
//     '/games-played',
//     userController.getMe,
//     userController.getUserScore
// );

export default router;
