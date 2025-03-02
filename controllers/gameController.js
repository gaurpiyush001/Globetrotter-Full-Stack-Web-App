import redisClient from '../config/redisClient.js';
import gameService from '../services/gameService.js';

class GameController {
  async startGame(req, res) {
    try {
      const { roomName, numQuestions = 5, mode = "single", playersUserIds = []/*unique useranme you get*/ } = req.body;

      // if ( playersUserIds.length == 0 ){
      playersUserIds.push(req.user._id);
      // }

      if ( mode == "single" && playersUserIds.length > 1 ) {
        return res.status(404).json({ message: 'Create a multi player game mode for players more than 1!' });
      } else if ( mode === "multiplayer" && playersUserIds.length <= 1 ) {
        return res.status(404).json({ message: 'Create a single player game mode!' });
      } 

      const gameData = await gameService.startGame(roomName, req.user._id, numQuestions, mode, playersUserIds);
      return res.status(201).json(gameData);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getNextQuestion(req, res) {
    try {
      const { gameId } = req.params;
      const question = await gameService.getNextQuestion(gameId);
      let gameSession = await redisClient.get(`game:${gameId}`);
      

      if (!question || question.question === null) {
        redisClient.del(`game:${gameId}`);
        let player_stats = [];
        let total_score = 0;
        gameSession = JSON.parse(gameSession);
        console.log("========= lastr ended ", gameSession, gameSession.players)
        if ( gameSession.players && gameSession.players.length > 0 ) {
          player_stats = gameSession.players[0];
          total_score = player_stats.correct - player_stats.incorrect;
          console.log("========= total_Score", total_score) 
        }
        // do something here if game is complete set the game status as complete
        return res.status(200).json({ question: { question : null, total_score, player_stats }  });
      }

      // res.json({ question });
      return res.status(200).json({question});
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getQuestion(req, res) {
    try {
      const { gameId } = req.params;
      const question = await gameService.getNextQuestion(gameId);
      if (!question) return res.status(404).json({ message: 'No more questions' });

      return res.status(200).json(question);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

//   async submitAnswer(req, res) {
//     try {
//       const { sessionId, gameId, questionId, response } = req.body;
//       const result = await gameService.submitAnswer(sessionId, gameId, questionId, response);
//       return res.status(200).json(result);
//     } catch (error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }
}

export default new GameController();
