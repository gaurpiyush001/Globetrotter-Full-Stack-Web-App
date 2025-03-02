import { v4 as uuidv4 } from 'uuid';
import gameRepository from '../repositories/gameRepository.js';
import userRepository from '../repositories/userRepository.js';
import questionRepository from '../repositories/questionRepository.js';
import userResponseRepository from '../repositories/userResponseRepository.js';
import redisClient from '../config/redisClient.js';
import userResponseService from './userResponseService.js';

class GameService {
    async startGame(name, createdBy, noOfQuestions, mode, playersUserIDs) {
        try {

            // Create new game instance
            const newGame = await gameRepository.createGame({
                name,
                mode,
                status: 'in_progress',
                no_of_questions: noOfQuestions,
                players: playersUserIDs.map(user_id => ({
                    user_id, incorrect: 0, correct: 0
                })),
                asked_questions: [],
                created_by: createdBy,
            });

            // Structure session data for Redis storage
            const gameSessionData = {
                players: playersUserIDs.map(user_id => ({
                    user_id,
                    correct: 0,
                    incorrect: 0,
                })),
                mode,
                status: 'in_progress',
                no_of_questions: noOfQuestions,
                asked_questions: [],//question_ids
            };

            // Store the game session in Redis (24-hour expiry)
            await redisClient.set(`game:${newGame._id}`, JSON.stringify(gameSessionData), 'EX', 86400);

            return {
                game: {
                    name: newGame.name,
                    game_id: newGame._id,
                    mode: newGame.mode,
                }
            };

        } catch (error) {
            console.error("Error starting game:", error);
            throw new Error("Failed to start the game. Please try again.");
        }
    }

    async getNextQuestion(gameId) {
        // Fetch game session from Redis
        let gameSession = await redisClient.get(`game:${gameId}`);

        if (!gameSession) {
            // If not in Redis, get from DB and cache it
            gameSession = await gameRepository.findGameById(gameId);
            if (!gameSession) throw new Error('Game with given ID not found');

            await redisClient.set(`game:${gameId}`, JSON.stringify(gameSession), 'EX', 86400);
        } else {
            gameSession = JSON.parse(gameSession);
        }

        // 🚀 **Check if all questions have been asked**
        console.log("gameSession.asked_questions.length=======", gameSession.asked_questions.length)
        console.log("=====gameSession.no_of_questions===", gameSession.no_of_questions)
        if (gameSession.asked_questions.length >= gameSession.no_of_questions) {
            // Update game status to "completed"
            gameSession.status = 'completed';
            await userResponseService.syncResponsesToDB(gameId);
            // delete teh cache, if game is completed
            await redisClient.del(`game:${gameId}:responses`);
            gameRepository.updateGameStatus(gameId, 'completed'); // Async DB update
            return { question: null }; // No more questions left
        }

        // Fetch a random question that hasn't been asked
        const newQuestion = await questionRepository.getRandomQuestionExcluding(gameSession.asked_questions);

        if (!newQuestion) {
            // gameSession, no new question left game completed
            gameSession.status = 'completed';
            // update the bulk here
            await userResponseService.syncResponsesToDB(gameId);
            await redisClient.del(`game:${gameId}:responses`);
            gameRepository.updateGameStatus(gameId, 'completed'); 
            return { question: null };
        } // No new questions available

        // Add question to asked list
        gameSession.asked_questions.push(newQuestion._id);
        // gameSession.asked_questions = asked_questions;

        // Update Redis session
        await redisClient.set(`game:${gameId}`, JSON.stringify(gameSession), 'EX', 86400);

        // ✅ **Batch update MongoDB in background**
        if (gameSession.asked_questions.length % 5 === 0 || gameSession.asked_questions.length === gameSession.no_of_questions) {
            gameRepository.updateAskedQuestions(gameId, gameSession.asked_questions);
            if (gameSession.asked_questions.length === gameSession.no_of_questions) {
                gameSession.status = 'completed';
                // await redisClient.del(`game:${gameId}:responses`);
                // await redisClient.del(`game:${gameId}`);
                await gameRepository.updateGameStatus(gameId, 'completed'); 
                return { question: null };
            }
            // delete the cache here
            // await redisClient.del(`game:${gameId}`);
        }

        return {
            question: newQuestion.clues,
            options: newQuestion.options,
            remaining_questions: gameSession.no_of_questions - gameSession.asked_questions.length, // 📌 Send remaining question count
        };
    }
    

    // async submitAnswer(sessionId, gameId, questionId, response) {
    //     const user = JSON.parse(await redisClient.get(sessionId));
    //     if (!user) throw new Error('Session expired or invalid');

    //     const game = await gameRepository.findGameById(gameId);
    //     if (!game || game.status === 'completed') throw new Error('Game not found or completed');

    //     const question = await questionRepository.findQuestionById(questionId);
    //     if (!question) throw new Error('Question not found');

    //     const isCorrect = question.actual_answer === response;

    //     // Store response in DB
    //     await userResponseRepository.createUserResponse({
    //         _id: `response_${uuidv4()}`,
    //         user_id: user._id,
    //         game_id: gameId,
    //         question_id: questionId,
    //         response,
    //         is_correct: isCorrect,
    //         timestamp: new Date(),
    //     });

    //     // Update user score
    //     const player = game.players.find((p) => p.user_id === user._id);
    //     if (player) player.score += isCorrect ? 1 : 0;
    //     await gameRepository.updateGame(game);

    //     // Update total score in User model
    //     user.total_score += isCorrect ? 1 : 0;
    //     await userRepository.updateUser(user);

    //     // Sync updated user to Redis
    //     await redisClient.set(sessionId, JSON.stringify(user), 'EX', 86400);

    //     return { isCorrect, message: isCorrect ? '🎉 Correct!' : '😢 Incorrect!', funFact: question.funfacts[0] };
    // }
}
const gameServiceInstance = new GameService();
export default gameServiceInstance;
