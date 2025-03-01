import mongoose from 'mongoose';
import Destination from './models/Destination.js'; // Your Destination model
import Question from './models/Question.js';
import User from './models/User.js'; // Ensure you have an Admin User model
const ADMIN_ID = new mongoose.Types.ObjectId("67c2fb96e9504ce40ce1ec22"); 


// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/globetrotter_game_db'; // Change as needed
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function generateQuestions(adminId) {
    try {
        // Fetch all destinations
        const destinations = await Destination.find();
        if (destinations.length < 4) {
            console.error("Need at least 4 destinations to generate valid questions.");
            return;
        }

        for (const destination of destinations) {
            const { _id, city, clues, fun_fact } = destination;

            // Select 3 random incorrect city options
            let incorrectOptions = destinations
                .filter(d => d.city !== city) // Exclude correct city
                .map(d => d.city);
            
            // Shuffle and pick 3 wrong options
            incorrectOptions = incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);

            // Ensure the correct answer is in options
            const options = [...incorrectOptions, city].sort(() => Math.random() - 0.5); // Shuffle

            // Create question document
            const question = new Question({
                destination: _id,
                clues,
                options,
                answer: city,
                answer_metadata: fun_fact, // Use fun facts as metadata
                createdBy: adminId, // Admin user ID
            });

            await question.save();
            console.log(`Question created for: ${city}`);
        }
    } catch (error) {
        console.error("Error generating questions:", error);
    } finally {
        mongoose.disconnect();
    }
}

// Run with an Admin's ID
async function validateAdmin(adminId) {
    const adminUser = await User.findOne({ _id: adminId, role: 'Admin' });
    if (!adminUser) {
        throw new Error("Invalid Admin ID or Admin does not exist.");
    }
}

async function run() {
    try {
        await validateAdmin(ADMIN_ID);
        await generateQuestions(ADMIN_ID);
    } catch (error) {
        console.error(error.message);
    } finally {
        mongoose.disconnect();
    }
}

run();

