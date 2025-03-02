import UserResponse from '../models/UserResponse.js';

class UserResponseRepository {
    async saveUserResponse(responseData) {
      try{
      console.log("asdvdvsdvsdvsdvsdv", responseData);
        return await UserResponse.create(responseData);
      } catch (err) {
      console.log("saveUserResponse", err)
    }
  }
    
    async bulkInsertUserResponses(responses) {
      console.log()
      try {
    return await UserResponse.insertMany(responses);
      } catch (err) {
        console.log("bulkInsertUserResponses", err)
      }
    }
}

export default new UserResponseRepository();


