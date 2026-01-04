import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import dotenv from "dotenv";
import { AppDataSource } from "../database/config";
import { Manager } from "../entities/manager.entity";
dotenv.config();

const router = express.Router();
const managerRepository = AppDataSource.getRepository(Manager);
// type Authentication = Either<HandleResponseError, { token: string }>;

const loginService = async (data: {
  senha: string;
  cpf: string;
}): Promise<any> => {

  const { senha, cpf } = data;

  const user = await managerRepository.findOne({
    where: {
        cpf: cpf,
        password: senha
    }
  })

  if (!user) {
    return false;
  }

  const senhaCorreta = await bcrypt.compare(senha, user.password);

  if (!senhaCorreta) {
    return false
  }

  const { id, name } = user;

  const token = sign({ id, name }, "osn2in0nmx--!@34noxm", {
    expiresIn: "30m",
  });

  return {accessToken: token};
};

router.post("/", async (req: Request, res: Response): Promise<any> => {

  const { cpf, senha } = req.body;

  const result = await loginService({ senha, cpf });

  if (result === false) {
    return res.status(400).json({
      message: "Usuário não existente ou credenciais inválidas",
    });
  }

  console.log(JSON.stringify(result));

  return res.status(200).json(result);
})

export default router;