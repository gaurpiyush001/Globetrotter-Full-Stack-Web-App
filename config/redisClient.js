import redis from 'redis';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

// process.env.REDIS_URL
// redis://<redis_host>:<redis_port>
let REDIS_URL = process.env.REDIS_URL.replace(
    '<redis_host>',
    process.env.REDIS_HOST
  );
REDIS_URL = REDIS_URL.replace(
    '<redis_port>',
    process.env.REDIS_PORT
)

// Create a Redis client instance
const redisClient = redis.createClient({
  url: REDIS_URL || 'redis://localhost:6379', // Use environment variable or default to localhost
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
