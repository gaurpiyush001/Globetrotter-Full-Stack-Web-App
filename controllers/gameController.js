import gameService from '../services/gameService.js';

class GameController {
  async startGame(req, res) {
    try {
      const { name, no_of_questions = 5, gameRoomName, mode = "single", playersUserName = []/*unique useranme you get*/ } = req.body;

      if ( playersUserName.length == 0 ){
        playersUserName.push(req.user.username);
      }

      if ( mode == "single" && playersUserName.length > 1 ) {
        return res.status(404).json({ message: 'Create a multi player game mode for players more than 1!' });
      } else if ( mode === "multiplayer" && playersUserName.length <= 1 ) {
        return res.status(404).json({ message: 'Create a single plyaer game mode!' });
      } 

      const gameData = await gameService.startGame(name, req.user.username, no_of_questions, gameRoomName, mode, playersUserName);
      return res.status(201).json(gameData);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getNextQuestion(req, res) {
    try {
      const { gameId } = req.params;
      const question = await gameService.getNextQuestion(gameId);

      if (!question) {
        // do something here if game is complete set the game status as complete
        return res.status(404).json({ message: 'Game Completed. No more questions available!' });
      }

      res.json({ question });
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
