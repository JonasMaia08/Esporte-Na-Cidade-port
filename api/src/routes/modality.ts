import express, { Request, Response } from "express";
import { AppDataSource } from "../database/config";
import { Modality } from "../entities/modality.entity";
import { Atendiment } from "src/entities/atendiment.entity";

const router = express.Router();
const modalityRepository = AppDataSource.getRepository(Modality);
const atendimentsRepository = AppDataSource.getRepository(Atendiment);

router.get("/", async (req: Request, res: Response) => {
  try {
    const modalities = await modalityRepository.find({
      relations: ["teachers"],
    });
    res.status(200).json(modalities);
  } catch (error) {
    console.error("Erro ao buscar modalidades:", error.message);
    res
      .status(500)
      .json({ message: "Erro ao buscar modalidades.", error: error.message });
  }
});

router.get("/:id/athletes-availible", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const athletes_availible = await modalityRepository.find({
    where: {
      id,
      registred_athletes: {
        enrollments: {
          active: true,
          aproved: true,
        },
      },
    },
    select: {
      registred_athletes: {
        name: true,
        cpf: true,
        id: true,
      },
      name: true,
      id: true,
    },
    order: {
      registred_athletes: {
        name: "ASC",
      },
    },
    relations: ["registred_athletes", "registred_athletes.enrollments"],
  });

  res.status(200).json({ athletes_availible });
});

router.post("/:id/receive-atendiments", async (req: Request, res: Response) => {
  try {
    const atendiments = req.body;

    /* OBJETO ESPERADO  
        atendiment: [{
            modalityId: number,
            athleteId: number,
            present: boolean
            created_at?: date --registro automatico ou de uma chamada de outro dia
        }]
    */

    if (!Array.isArray(atendiments) || atendiments.length === 0) {
      res.status(400).json({ message: "Dados de atendimento inválidos." });
    }

    await atendimentsRepository.insert(atendiments);

    res.status(201).json({ message: "Atendimentos registrados com sucesso." });
  } catch (error) {
    console.error("Erro ao registrar atendimentos:", error.message);
    res.status(500).json({
      message: "Erro ao registrar atendimentos.",
      error: error.message,
    });
  }
});

export default router;
