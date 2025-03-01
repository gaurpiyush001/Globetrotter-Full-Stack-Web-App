import questionService from "../services/questionService.js";

class QuestionController {
  async createQuestion(req, res) {
    try {
      const question = await questionService.createQuestion(req.body);
      return res.status(201).json(question);
    } catch (error) {
      return res.status(500).json({ message: "Error creating question", error: error.message });
    }
  }

  async getAllQuestions(req, res) {
    try {
      const questions = await questionService.getAllQuestions();
      return res.status(200).json(questions);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching questions", error: error.message });
    }
  }

  async getQuestionById(req, res) {
    try {
      const question = await questionService.getQuestionById(req.params.id);
      if (!question) return res.status(404).json({ message: "Question not found" });
      return res.status(200).json(question);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching question", error: error.message });
    }
  }

  async updateQuestion(req, res) {
    try {
      const updatedQuestion = await questionService.updateQuestion(req.params.id, req.body);
      if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });
      return res.status(200).json(updatedQuestion);
    } catch (error) {
      return res.status(500).json({ message: "Error updating question", error: error.message });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const deletedQuestion = await questionService.deleteQuestion(req.params.id);
      if (!deletedQuestion) return res.status(404).json({ message: "Question not found" });
      return res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting question", error: error.message });
    }
  }
}

export default new QuestionController();
