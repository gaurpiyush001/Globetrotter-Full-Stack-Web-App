import { v4 as uuidv4 } from 'uuid';
import userRepository from '../repositories/userRepository.js';
import redisClient from '../config/redisClient.js';

class UserService {
  async registerUser(username, source = "organic", role="User") {
    let existingUser = await userRepository.findUserByUsernameOrSessionId(username);
    
    if (existingUser) throw new Error(`User already registered with given username! Try logging in`); // Return existing user if found

    // Generate session-based UUID
    const sessionId = `session_${uuidv4()}`;

    const newUser = await userRepository.createUser({
      username,
      total_score: 0,
      invitation_count: 0,
      source, // do this dynamic - organic or dynamic 
      session_id: sessionId,
      role,
    });
    // Store session in Redis for quick lookup
    await redisClient.set(`userData:${username}`, JSON.stringify(newUser), 'EX', 86400); // 24 hrs expiry

    return newUser;
  }

  async loginUser(username, session_id) {
    try {
        const existingSession = await redis.get(`userData:${username}`);
        if (existingSession && existingSession.gameStatus === 'active') {
            return res.status(400).json({ message: "Username already in use. Please wait for the session to complete." });
        }

        // Call repository function to find the user
        const user = await userRepository.findUserByUsernameOrSessionId(username, session_id);
    
        if (!user) {
            // If no user found, throw error to be handled in the controller
            return null;
        }
    
        // Return user data if found
        return user;
    } catch (error) {
        // Handle errors and throw a meaningful message
        throw new Error('Error in user login: ' + error.message);
    }
  }

  async getUserBySession(sessionId) {
    // Check Redis first for performance
    let cachedUser = await redisClient.get(sessionId);
    if (cachedUser) return JSON.parse(cachedUser);

    // Fetch from MongoDB if not found in Redis
    let user = await userRepository.findUserBySession(sessionId);
    
    if (!user) return null; // If user doesn't exist, return null

    // Check if session is expired (Example: if last_active > 30 days ago)
    const sessionExpired = new Date() - new Date(user.last_active) > 30 * 24 * 60 * 60 * 1000;
    if (sessionExpired) {
        // Generate a new session ID
        const newSessionId = `session_${uuidv4()}`;
        
        // Update user session in MongoDB
        user.session_id = newSessionId;
        user.last_active = new Date();
        await user.save();

        // Store in Redis
        await redisClient.set(newSessionId, JSON.stringify(user), 'EX', 86400); // 24-hour expiry

        return user;
    }

    // Store session in Redis before returning
    await redisClient.set(sessionId, JSON.stringify(user), 'EX', 86400);
    
    return user;
  }

}

const userServiceInstance = new UserService();
export default userServiceInstance;
