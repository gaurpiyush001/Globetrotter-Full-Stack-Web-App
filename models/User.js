import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, 'Username is required'],
      index: true, // Improves search performance
    },
    total_score: {
      type: Number,
      default: 0,
      min: 0, // Ensures score can't be negative
    },
    invitation_count: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return value <= 3; // Ensures it never exceeds 3
        },
        message: 'Invitation count cannot exceed 3',
      },
    },
    source: {
      type: String,
      enum: ['invite', 'organic'],
      required: true,
    },
    last_active: {
      type: Date,
      default: Date.now,
    },
    session_id: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate sessions
    },
    role: {
      type: String,
      enum: ['Admin', 'User'],
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// userSchema.index({ username: 1 });
// userSchema.index({ session_id: 1 });
const User = model('User', userSchema);
export default User;
