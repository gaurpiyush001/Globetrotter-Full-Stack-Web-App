import userResponseService from "../services/userResponseService.js";

class UserResponseController {
  async submitAnswer(req, res) {
    try {
      const { gameId, questionId, selectedOption } = req.body;
      const userId = req.user._id;
      const response = await userResponseService.processAnswer(gameId, userId, questionId, selectedOption);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: "Error submitting answer", error: error.message });
    }
  }
}

export default new UserResponseController();
