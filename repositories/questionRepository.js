import Question from '../models/Question.js';

class QuestionRepository {
    async findQuestionById(questionId) {
        return await Question.findById(questionId).select('-_id -clues -destination -createdBy');
    }

    //   async getUnaskedQuestion(askedQuestions) {
    //     return await Question.findOne({ _id: { $nin: askedQuestions } });
    //   }

    async getRandomQuestionExcluding(askedQuestions) {
        return await Question.aggregate([
            { $match: { _id: { $nin: askedQuestions } } }, // Exclude asked questions
            { $sample: { size: 1 } }, // Pick one random question 
        ]).then(res => res[0]); // Return single document
    }

    async createQuestion(data) {
        return await Question.create(data);
    }

    async getAllQuestions() {
        return await Question.find();
    }

    async updateQuestion(id, data) {
        return await Question.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteQuestion(id) {
        return await Question.findByIdAndDelete(id);
    }

    async getQuestionById(id) {
        return await Question.findById(id);
    }

}

export default new QuestionRepository();

