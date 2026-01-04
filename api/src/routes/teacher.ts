import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../database/config";

import env from "../environment/env";

import { Teacher } from "../entities/teacher.entity";
import { Roles } from "../enums/roles.enum";
import { Token } from "../entities/token.entity";
import { TeacherController } from "../controllers/teacher.controller";

import crypto from "crypto";
import {
  PASSWORD_RESET_BODY_TEMPLATE,
  sendEmail,
} from "../services/email-service";
import { isPasswordValid } from "../utils/isPasswordValid";

const router = express.Router();
const teacherRepository = AppDataSource.getRepository(Teacher);
const tokenRepository = AppDataSource.getRepository(Token);

router
  .get("/", async (req: Request, res: Response) => {
    try {
      const teachers = await teacherRepository.find({
        where: { active: true },
        relations: ["modality"],
      });

      res.json(teachers);
    } catch (error) {
      console.error("Erro ao buscar professores:", error.message);
      console.error(error.stack);
      res
        .status(500)
        .json({ message: "Erro ao buscar professores.", error: error.message });
    }
  })
  .get("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const teacherId = parseInt(req.params.id, 10);

      if (isNaN(teacherId)) {
        return res.status(400).json("ID de professor inválido.");
      }

      const teacher = await teacherRepository.find({
        where: {
          id: teacherId,
          active: true,
        },
        relations: ["modality"],
      });
      if (!teacher) {
        return res.status(404).json("Professor não encontrado.");
      }

      res.status(200).json(teacher);
    } catch (error) {
      console.error("Erro ao buscar professor:", error);
      res.status(500).json("Erro ao buscar professor.");
    }
  })
  .post("/", async (req: Request, res: Response) => {
    try {
      const { password, ...otherFields } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const teacher = teacherRepository.create({
        ...otherFields,
        role: Roles.TEACHER,
        password: hashedPassword,
      });

      await teacherRepository.save(teacher);
      res.status(201).json(teacher);
    } catch (error) {
      console.error("Erro ao criar professor:", error);
      res.status(500).json("Erro ao criar professor.");
    }
  })
  .post("/password-reset", async (req, res) => {
    try {
      if (!req.body.email) {
        return res
          .status(400)
          .send({ error: "The teacher's e-mail is required" });
      }

      const teacher = await teacherRepository.findOne({
        where: {
          email: req.body.email,
          active: true,
        }
      });

      if (!teacher)
        return res
          .status(400)
          .send({ error: "A teacher with the given e-mail doesn't exist" });

      var token = await tokenRepository.findOne({
        where: {
          teacher: { id: teacher.id },
        },
      });

      if (!token) {
        token = tokenRepository.create({
          teacher: teacher,
          token: crypto.randomBytes(32).toString("hex"),
        });

        await tokenRepository.save(token);
      }

      const link = `${process.env.BASE_URL}/password-reset/${teacher.id}/${token.token}`;

      let email_body = PASSWORD_RESET_BODY_TEMPLATE.replace(
        "{{user_name}}",
        teacher.name
      ).replace("{{reset_link}}", link);

      await sendEmail(teacher.email, "Password reset", email_body);

      res.send({ message: "password reset link sent to your email account" });
    } catch (error) {
      res.send("An error occured");
      console.log(error);
    }
  })
  .post("/password-reset/:teacherId/:token", async (req, res) => {
    try {
      if (!isPasswordValid(req.body.password))
      {
        res.status(400).send("Password must have at least 8 characters. At least 1 uppercase and 1 lowercase letter. At least one digit. At least one special character");
        return;
      }

      const teacher = await teacherRepository.findOne({
        where:{
        id: Number(req.params.teacherId),
        active: true
        }
      });
      if (!teacher) return res.status(400).send("invalid link or expired");

      const token = await tokenRepository.findOne({
        where: {
          teacher: { id: teacher.id },
          token: req.params.token,
        },
        relations: ["teacher"],
      });

      if (!token) return res.status(400).send("Invalid link or expired");

      teacher.password = await bcrypt.hash(req.body.password, 10);

      await teacherRepository.save(teacher);
      await tokenRepository.delete(token);

      res.send("password reset sucessfully.");
    } catch (error) {
      res.send("An error occured");
      console.log(error);
    }
  })
  .put("/:id", TeacherController.update)
  .delete("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const teacherId = parseInt(req.params.id, 10);

      if (isNaN(teacherId)) {
        return res.status(400).json("ID de professor inválido.");
      }

      const teacher = await teacherRepository.findOneBy({ id: teacherId });
      if (!teacher) {
        return res.status(404).json("Professor não encontrado.");
      }

      teacher.active = false;
      await teacherRepository.save(teacher);
      res.status(200).json("Professor deletado com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar professor:", error);
      res.status(500).json("Erro ao deletar professor.");
    }
  });

export default router;
