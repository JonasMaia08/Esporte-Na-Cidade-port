import express from "express";
import { AthleteController } from "../controllers/athlete.controller";



const router = express.Router();

router.get("/", AthleteController.getAll);
router.get("/:id", AthleteController.getById);
router.post("/", AthleteController.create);
router.put("/:id", AthleteController.update);
router.delete("/:id", AthleteController.delete);

export default router;