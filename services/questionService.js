import questionRepository from "../repositories/questionRepository.js";

class QuestionService {
  async createQuestion(data) {
    return await questionRepository.createQuestion(data);
  }

  async getAllQuestions() {
    return await questionRepository.getAllQuestions();
  }

  async getQuestionById(id) {
    return await questionRepository.getQuestionById(id);
  }

  async updateQuestion(id, data) {
    return await questionRepository.updateQuestion(id, data);
  }

  async deleteQuestion(id) {
    return await questionRepository.deleteQuestion(id);
  }
}

export default new QuestionService();
