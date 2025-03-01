import Game from '../models/Game.js';

class GameRepository {
  async createGame(gameData) {
    return await Game.create(gameData);
  }

  async findGameById(gameId) {
    return await Game.findById(gameId).select('-_id');
  }

  async updateGame(game) {
    return await Game.save();
  }

  async updateAskedQuestions(gameId, askedQuestions) {
    await Game.findByIdAndUpdate(gameId, { asked_questions: askedQuestions });
  }
  async updateGameStatus(gameId, status) {
    await Game.findByIdAndUpdate(gameId, { status });
  }

  async updateGamePlayerStats(gameId, responses) {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');

    // Update player scores
    responses.forEach(({ user_id, is_correct }) => {
      const player = game.players.find(p => p.user_id === user_id);
      if (player) {
        if (is_correct) player.correct += 1;
        else player.incorrect += 1;
      }
    });

    return await game.save();
  }

}

export default new GameRepository();
