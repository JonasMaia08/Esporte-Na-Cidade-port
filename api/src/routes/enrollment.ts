import express, { Request, Response } from "express";
import { AppDataSource } from "../database/config";
import { Athlete } from "../entities/athlete.entity";

const router = express.Router();
const userRepository = AppDataSource.getRepository(Athlete);

router.post("/", async (req: Request, res: Response) => {
    try {
        const { userId, modalityId } = req.body;

        console.log("\n\n");
        console.log(`user id: ${userId}`);
        console.log(`modality id: ${modalityId}`);
        console.log("\n\n");

        res.status(500).json({message: "not implemented."});
    } catch (error) {
        console.error("error message", error.message);
        res.status(500).json({ message: "error message", error: error.message });
    }
});

export default router;
