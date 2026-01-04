import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../database/config";
import { Manager } from "../entities/manager.entity";
import { Roles } from "../enums/roles.enum";

const router = express.Router();
const managerRepository = AppDataSource.getRepository(Manager);

router
    .get("/", async (req: Request, res: Response) => {
        try {
            const managers = await managerRepository.find();
            res.json(managers);
        } catch (error) {
            console.error("Erro ao buscar gerentes:", error.message);
            console.error(error.stack);
            res.status(500).json({ message: "Erro ao buscar gerentes.", error: error.message });
        }
    })
    .get("/:id", async (req: Request, res: Response): Promise<any> => {
        try {
            const managerId = parseInt(req.params.id, 10);

            if (isNaN(managerId)) {
                return res.status(400).json("ID de gerente inválido.");
            }

            const manager = await managerRepository.findOneBy({ id: managerId });
            if (!manager) {
                return res.status(404).json("Gerente não encontrado.");
            }

            res.status(200).json(manager);
        } catch (error) {
            console.error("Erro ao buscar gerente:", error);
            res.status(500).json("Erro ao buscar gerente.");
        }
    })
    .post("/", async (req: Request, res: Response) => {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const manager = managerRepository.create({
                ...req.body,
                password: hashedPassword,
                role: Roles.MANAGER,
            });

            await managerRepository.save(manager);
            res.status(201).json(manager);
        } catch (error) {
            console.error("Erro ao criar gerente:", error);
            res.status(500).json("Erro ao criar gerente.");
        }
    })
    .put("/:id", async (req: Request, res: Response): Promise<any> => {
        try {
            const managerId = parseInt(req.params.id, 10);

            if (isNaN(managerId)) {
                return res.status(400).json("ID de gerente inválido.");
            }

            const manager = await managerRepository.findOneBy({ id: managerId });
            if (!manager) {
                return res.status(404).json("Gerente não encontrado.");
            }

            manager.name = req.body.name || manager.name;
            manager.cpf = req.body.cpf || manager.cpf;
            manager.rg = req.body.rg || manager.rg;
            manager.birthday = req.body.birthday || manager.birthday;
            manager.phone = req.body.phone || manager.phone;
            manager.photo_url = req.body.photo_url || manager.photo_url;
            manager.email = req.body.email || manager.email;

            if (req.body.password) {
                manager.password = await bcrypt.hash(req.body.password, 10);
            }

            await managerRepository.save(manager);
            res.status(200).json(manager);
        } catch (error) {
            console.error("Erro ao atualizar gerente:", error);
            res.status(500).json("Erro ao atualizar gerente.");
        }
    })
    .delete("/:id", async (req: Request, res: Response): Promise<any> => {
        try {
            const managerId = parseInt(req.params.id, 10);

            if (isNaN(managerId)) {
                return res.status(400).json("ID de gerente inválido.");
            }

            const manager = await managerRepository.findOneBy({ id: managerId });
            if (!manager) {
                return res.status(404).json("Gerente não encontrado.");
            }

            await managerRepository.remove(manager);
            res.status(200).json("Gerente deletado com sucesso.");
        } catch (error) {
            console.error("Erro ao deletar gerente:", error);
            res.status(500).json("Erro ao deletar gerente.");
        }
    });

export default router;