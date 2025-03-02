// DotEnv is a lightweight npm package that automatically loads environment variables from a .env file into the process .env object
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import mongoose from 'mongoose';

// The process object in Node.js is a global object that can be accessed inside any module without requiring it.
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});


// You can create an.env file in the application's root directory that contains key/value pairs defining the project's required environment variables. The dotenv library reads this.env file and appends it to process.env
console.log("===========================")
console.log(process.env);//--->Uncomment this and see all the process Environment Variables

import app from './app.js';

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// U6P9iGO0EqgsluSs
// cEGNY8ZsXp3GLVWs
// const DB = "mongodb+srv://gaurpiyush001:U6P9iGO0EqgsluSs@cluster-globetrotter.gb19p.mongodb.net/globetrotter_game_db?retryWrites=true&w=majority&appName=Cluster-Globetrotter"


//Yaha NodeJs ke code ko MondoDB Server/MongoDB database se connect kr raha hun 
mongoose.connect(DB)
  .then(() => {
    console.log('DB connection successful!')
    console.log('Connected to MongoDB Atlas!');
    console.log('Connected DB:', mongoose.connection.name); // This will print the name of the current database
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

console.log(app.get('env'));


process.on('SIGINT', () => {
  console.log('Gracefully shutting down...');
  server.close(() => {
    console.log('Closed all connections');
    process.exit(0);
  });
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
