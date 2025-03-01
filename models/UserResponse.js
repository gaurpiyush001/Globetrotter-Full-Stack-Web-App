import mongoose from 'mongoose';

const userResponseSchema = new mongoose.Schema(
  {
    user_id: {
      type: String, // Reference to the user who answered
      required: true,
      ref: 'User',
    },
    game_id: {
      type: String, // Reference to the game in which the response was given
      required: true,
      ref: 'Game',
    },
    question_id: {
      type: String, // Reference to the question being answered
      required: true,
      ref: 'Question',
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now, // Defaults to current timestamp
    },
    response: {
      type: String, // The user's answer
      required: true,
    },
    is_correct: {
      type: Boolean, // Whether the response was correct or not
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

const UserResponse = mongoose.model('UserResponse', userResponseSchema);

export default UserResponse;
