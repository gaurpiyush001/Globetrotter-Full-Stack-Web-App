import userRepositoryInstance from '../repositories/userRepository.js';
import userServiceInstance from '../services/userService.js';

class UserController {
  async register(req, res) {
    try {
      const { username, source = "organic", role = "User" } = req.body;
      if (!username) return res.status(400).json({ error: 'Username is required' });

      const user = await userServiceInstance.registerUser(username, source, role);
      return res.status(201).json({ message: "User registered", session_id: user.session_id, username: user.username, total_score: user.total_score });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    const { username, session_id } = req.body;
  
    try {
      // Find user by session_id or username (or both)
      const existingUser = await userServiceInstance.loginUser(username, session_id); 
    //   User.findOne({ $or: [{ username }, { session_id }] });
  
      if (existingUser) {
        // If user found, return their session details or any other relevant information
        res.status(200).json({
          message: 'User logged in successfully',
          session_id: existingUser.session_id,
          username: existingUser.username,
          total_score: existingUser.total_score,
        });
      } else {
        // If user not found, suggest registration
        // res.status(404).json({
        //   message: 'User not found, please register.',
        // });
        throw new Error(`User not found, please register.`)
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({
        message: error.message,
      });
    }
  }

  async getProfile(req, res) {
    try {
      // `req.user` is already set by the sessionMiddleware
      if (!req.user) {
        return res.status(401).json({ message: "Invalid session or user not found" });
      }

      res.status(200).json({
        message: "User fetched successfully",
        user: req.user, // Send user data to frontend
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

const userControllerInstance = new UserController();
export default userControllerInstance;
