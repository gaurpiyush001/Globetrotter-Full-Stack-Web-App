import destinationRepository from "../repositories/destinationRepository.js";

class DestinationService {
  async createDestination(data) {
    return await destinationRepository.createDestination(data);
  }

  async getAllDestinations() {
    return await destinationRepository.getAllDestinations();
  }

  async getDestinationById(id) {
    return await destinationRepository.getDestinationById(id);
  }

  async updateDestination(id, data) {
    return await destinationRepository.updateDestination(id, data);
  }

  async deleteDestination(id) {
    return await destinationRepository.deleteDestination(id);
  }
}

export default new DestinationService();
