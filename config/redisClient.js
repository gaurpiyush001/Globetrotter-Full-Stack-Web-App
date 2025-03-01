import redis from 'redis';

// Create a Redis client instance
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', // Use environment variable or default to localhost
});

// Redis Client Error Handling
redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Connect to Redis (if not using Redis v4)
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Error connecting to Redis:', err);
    process.exit(1); // Exit process if Redis connection fails
  }
}

connectRedis();

export default redisClient;
