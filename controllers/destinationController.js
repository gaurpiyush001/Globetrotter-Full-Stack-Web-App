import destinationService from "../services/destinationService.js";

class DestinationController {
  async createDestination(req, res) {
    try {
      const destination = await destinationService.createDestination(req.body);
      return res.status(201).json(destination);
    } catch (error) {
      return res.status(500).json({ message: "Error creating destination", error: error.message });
    }
  }

  async getAllDestinations(req, res) {
    try {
      const destinations = await destinationService.getAllDestinations();
      return res.status(200).json(destinations);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching destinations", error: error.message });
    }
  }

  async getDestinationById(req, res) {
    try {
      const destination = await destinationService.getDestinationById(req.params.id);
      if (!destination) return res.status(404).json({ message: "Destination not found" });
      return res.status(200).json(destination);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching destination", error: error.message });
    }
  }

  async updateDestination(req, res) {
    try {
      const updatedDestination = await destinationService.updateDestination(req.params.id, req.body);
      if (!updatedDestination) return res.status(404).json({ message: "Destination not found" });
      return res.status(200).json(updatedDestination);
    } catch (error) {
      return res.status(500).json({ message: "Error updating destination", error: error.message });
    }
  }

  async deleteDestination(req, res) {
    try {
      const deletedDestination = await destinationService.deleteDestination(req.params.id);
      if (!deletedDestination) return res.status(404).json({ message: "Destination not found" });
      return res.status(200).json({ message: "Destination deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting destination", error: error.message });
    }
  }
}

export default new DestinationController();
