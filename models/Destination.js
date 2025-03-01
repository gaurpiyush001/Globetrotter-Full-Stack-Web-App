import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    clues: {
      type: [String], // Array of clue strings
      required: true,
    },
    fun_fact: {
      type: [String], // Array of fun fact strings
      required: false,
    },
    trivia: {
      type: [String], // Array of fun fact strings
      required: false,
    },
    images: {
      type: [String], // Array of image URLs
      required: false,
      validate: {
        validator: function (arr) {
          return arr.every(url => /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(url));
        },
        message: 'Each image must be a valid URL ending in .jpg, .jpeg, .png, or .gif',
      },
    },
  },
  { timestamps: true }
);

// ✅ Add a compound unique index for city & country
destinationSchema.index({ city: 1, country: 1 }, { unique: true });

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;