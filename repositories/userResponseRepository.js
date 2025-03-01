import UserResponse from '../models/UserResponse.js';

class UserResponseRepository {
    async saveUserResponse(responseData) {
        return await UserResponse.create(responseData);
      }
    
    async bulkInsertUserResponses(responses) {
    return await UserResponse.insertMany(responses);
    }
}

export default new UserResponseRepository();


