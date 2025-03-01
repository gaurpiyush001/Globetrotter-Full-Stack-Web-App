import Destination from '../models/Destination.js';

class DestinationRepository {
  async createDestination(destinationData) {
    return await Destination.create(destinationData);
  }

  async findDestinationById(destinationId) {
    return await Destination.findById(destinationId);
  }

  async findDestinationByName(name) {
    return await Destination.findOne({ name });
  }

  async getRandomDestinations(limit = 10) {
    return await Destination.aggregate([{ $sample: { size: limit } }]);
  }

  async getAllDestinations() {
    return await Destination.find();
  }

  async updateDestination(destinationId, updateData) {
    return await Destination.findByIdAndUpdate(destinationId, updateData, { new: true });
  }

  async deleteDestination(destinationId) {
    return await Destination.findByIdAndDelete(destinationId);
  }
}

export default new DestinationRepository();
