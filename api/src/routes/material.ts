import express from "express";
const router = express.Router();

import { AppDataSource } from "../database/config";
import { Material } from "../entities/material.entity";

const materialRepository = AppDataSource.getRepository(Material);

router.get("/", async (req, res) => {
    const materials = await materialRepository.find();

    console.log(materials);
    
    res.send(materials);
});

export default router;