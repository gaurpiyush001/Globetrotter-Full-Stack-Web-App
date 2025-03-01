import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Destination model
      ref: 'Destination',
      required: true,
    },
    clues: {
      type: [String], // Array of clue strings
      required: true,
    },
    options: {
      type: [String], // List of possible answers (city names)
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length >= 2; // At least two options
        },
        message: 'At least two options are required',
      },
    },
    answer: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return this.options.includes(value); // Ensure answer is one of the options
        },
        message: 'Answer must be one of the provided options',
      },
    },
    answer_metadata: {
      type: [String], // Fun facts
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Admin/User model
      ref: 'User', // Ensure only Admin users are referenced
      required: true,
    },
  },
  { timestamps: true } // Auto-generate createdAt and updatedAt
);

const Question = mongoose.model('Question', questionSchema);

export default Question;
