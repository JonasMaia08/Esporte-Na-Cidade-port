import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../database/config";
import { UserBase } from "../entities/user-base.entity";
import { Roles } from "../enums/roles.enum";

const router = express.Router();
const userRepository = AppDataSource.getRepository(UserBase);

router
  .get("/", async (req: Request, res: Response) => {
    try {
      const users = await userRepository.find();
      res.json(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error.message);
      console.error(error.stack);
      res
        .status(500)
        .json({ message: "Erro ao buscar usuários.", error: error.message });
    }
  })
  .get("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        return res.status(400).json("ID de usuário inválido.");
      }

      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json("Usuário não encontrado.");
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json("Erro ao buscar usuário.");
    }
  })
  .post("/", async (req: Request, res: Response) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = userRepository.create({
        ...req.body,
        password: hashedPassword,
        role: req.body.role || Roles.ATHLETES,
      });

      await userRepository.save(user);
      res.status(201).json(user);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json("Erro ao criar usuário.");
    }
  })
  .put("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        return res.status(400).json("ID de usuário inválido.");
      }

      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json("Usuário não encontrado.");
      }

      user.name = req.body.name || user.name;
      user.cpf = req.body.cpf || user.cpf;
      user.rg = req.body.rg || user.rg;
      user.birthday = req.body.birthday || user.birthday;
      user.phone = req.body.phone || user.phone;
      user.photo_url = req.body.photo_url || user.photo_url;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
      }

      await userRepository.save(user);
      res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json("Erro ao atualizar usuário.");
    }
  })
  .delete("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        return res.status(400).json("ID de usuário inválido.");
      }

      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json("Usuário não encontrado.");
      }

      await userRepository.remove(user);
      res.status(200).json("Usuário deletado com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      res.status(500).json("Erro ao deletar usuário.");
    }
  });

export default router;
