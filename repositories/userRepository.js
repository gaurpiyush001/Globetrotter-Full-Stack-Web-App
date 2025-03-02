import User from '../models/User.js';

class UserRepository {
  async createUser(userData) {

    try {
      console.log(userData)
      const user = await User.create(userData);
      const userWithoutFields = user.toObject();
      delete userWithoutFields.__v;
      delete userWithoutFields._id;
  
      return userWithoutFields;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Duplicate username or session_id detected.');
      }
      throw error; // rethrow other errors
    }
    // return await User.create(userData);
  }


  async findUserByUsernameOrSessionId(username, session_id) {
    try {
      // Search for user by either username or session_id
      const user = await User.findOne({ 
        $or: [{ username }, { session_id }] 
      }).select('-__v -session_id');
  
      if (user) {
        // If a user is found, return the user object
        return user;
      } else {
        // If no user is found, return null
        return null;
      }
    } catch (error) {
      console.error('Error in finding user:', error);
      throw new Error('Error in finding user');
    }
  }

  async updateSessionId(user, sessionID) {
    try {
      // Update the sessionId of the user
      const updatedUser = await User.findOneAndUpdate(
        { username: user.username },  // Find the user by their username
        { session_id: sessionID },    // Set the new session_id
        { new: true }                 // Return the updated user object
      );
  
      if (!updatedUser) {
        throw new Error('User not found');
      }
  
      // Optionally, return the updated user or just return success
      return updatedUser;
    } catch (error) {
      console.error('Error updating sessionId:', error);
      throw new Error('Error updating session ID');
    }
  }

}

const userRepositoryInstance = new UserRepository();
export default userRepositoryInstance;
