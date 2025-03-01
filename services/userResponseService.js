import gameRepository from '../repositories/gameRepository.js';
import questionRepository from '../repositories/questionRepository.js'
import userResponseRepository from '../repositories/userResponseRepository.js';
import redisClient from '../config/redisClient.js';

class UserResponseService {
  async processAnswer(gameId, userId, selectedOption) {
    // 🔹 **Fetch game session from Redis**
    let gameSession = await redisClient.get(`game:${gameId}`);
    let timestamp = Date.now();

    if (!gameSession) {
      // If not in Redis, fetch from DB and cache it
      gameSession = await gameRepository.findGameById(gameId);
      if (!gameSession) throw new Error('Game session not found');
      await redisClient.set(`game:${gameId}`, JSON.stringify(gameSession), 'EX', 86400);
    } else {
      gameSession = JSON.parse(gameSession);
    }

    const { mode, players, asked_questions } = gameSession;

    // 🚀 **Get current question (last asked)**
    const currentQuestionId = asked_questions[asked_questions.length - 1];

    if (!currentQuestionId) {
        // burst the cache here for this game
        throw new Error('No active question');
    }

    // ✅ **Validate user response**
    const questionData = await redisClient.get(`question:${currentQuestionId}`);
    let correctAnswer;
    
    if (!questionData) {
      const questionFromDB = await questionRepository.findQuestionById(currentQuestionId);
      if (!questionFromDB) throw new Error('Invalid question');
      correctAnswer = questionFromDB.answer;
      await redisClient.set(`question:${currentQuestionId}`, JSON.stringify(questionFromDB), 'EX', 86400);
    } else {
      correctAnswer = JSON.parse(questionData).answer;
    }

    const isCorrect = selectedOption === correctAnswer;

    // ✅ **Update user’s score in Redis**
    const updatedPlayers = players.map(player => {
      if (player.user_id === userId) {
        return {
          ...player,
          correct: isCorrect ? player.correct + 1 : player.correct,
          incorrect: !isCorrect ? player.incorrect + 1 : player.incorrect,
        };
      }
      return player;
    });

    gameSession.players = updatedPlayers;
    await redisClient.set(`game:${gameId}`, JSON.stringify(gameSession), 'EX', 86400);

    // ✅ **Batch store responses & update MongoDB periodically**
    await redisClient.rPush(
      `game:${gameId}:responses`,
      JSON.stringify({ user_id: userId, game_id: gameId, timestamp, question_id: currentQuestionId, response: selectedOption, is_correct: isCorrect })
    );

    // **Batch update MongoDB asynchronously**
    if (asked_questions.length % 5 === 0 || mode === 'multiplayer') {
      this.syncResponsesToDB(gameId);
    }

    return { isCorrect, correctAnswer, answerMetadata: questionData.answer_metadata };
  }

  // 🔹 **Batch update responses in MongoDB (executed in background)**
  async syncResponsesToDB(gameId) {
    const responses = await redisClient.lRange(`game:${gameId}:responses`, 0, -1);
    if (responses.length === 0) return;

    const parsedResponses = responses.map(resp => JSON.parse(resp));

    // ✅ **Bulk insert user responses**
    await userResponseRepository.bulkInsertUserResponses(parsedResponses);

    // ✅ **Update game player stats in MongoDB**
    await gameRepository.updateGamePlayerStats(gameId, parsedResponses);

    // ✅ **Clear processed responses from Redis**
    await redisClient.del(`game:${gameId}:responses`);
  }
}

export default new UserResponseService();
