import express from "express";
import destinationController from "../controllers/destinationController.js";

const router = express.Router();

//  below routes only accessible to ADMIN

router.post("/", destinationController.createDestination);
router.get("/", destinationController.getAllDestinations);
router.get("/:id", destinationController.getDestinationById);
router.put("/:id", destinationController.updateDestination);
router.delete("/:id", destinationController.deleteDestination);

export default router;
