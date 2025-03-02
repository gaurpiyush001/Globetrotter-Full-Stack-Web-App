import redisClient from "../config/redisClient.js"; // Redis connection
import userRepositoryInstance from "../repositories/userRepository.js";

class SessionMiddleware {
  async protect(req, res, next) {
    try {
      const sessionId = req.headers["x-session-id"]; // Extract session_id from headers
      // const user_name = req.headers["username"]
      if (!sessionId) {
        return res.status(401).json({ message: "Session ID is required" });
      }

      // Check in Redis cache first (for better performance)
      let userData = await redisClient.get(`userData:${sessionId}`);
      if (!userData) {
        // Fetch from MongoDB if not found in Redis
        const user = await userRepositoryInstance.findUserByUsernameOrSessionId(sessionId);
        if (!user) {
          return res.status(401).json({ message: "Invalid or expired session" });
        }

        // Cache user data in Redis with TTL (e.g., 24 hours)
        await redisClient.setEx(`userData:${sessionId}`, 86400, JSON.stringify(user)); // 86400 seconds = 24 hours
        await redisClient.setEx(`userData:${user.username}`, 86400, JSON.stringify({is_present: true}));
        userData = JSON.stringify(user);
      }

      // Attach user data to request object for further use in controllers
      req.user = JSON.parse(userData);
      next(); // Continue to the next middleware/controller
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new SessionMiddleware();
