import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ['single', 'multiplayer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'in_progress', 'completed'],
      required: true,
    },
    no_of_questions: {
      type: Number,
      required: true,
      min: 1,
    },
    players: [
      {
        user_id: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        correct: {
          type: Number,
          required: true,
          default: 0,
        },
        incorrect: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    created_by: {
      type: mongoose.Schema.ObjectId, // Reference to the user who created
      required: true,
      ref: 'User',
    },
    asked_questions: {
      type: [mongoose.Schema.ObjectId], // Array of question IDs
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length <= this.no_of_questions; // Ensures questions array doesn't exceed limit
        },
        message: 'Number of asked questions exceeds the specified limit',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } // Enable virtual fields in JSON responses
);

// **Virtual Field: Cumulative Score**
gameSchema.virtual('cumulative_scores').get(function () {
  if (this.status !== 'completed') return null; // Only compute if the game is completed

  return this.players.map(player => ({
    user_id: player.user_id,
    total_score: player.correct + player.incorrect, // Sum correct + incorrect answers
  }));
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
