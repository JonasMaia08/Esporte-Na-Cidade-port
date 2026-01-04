import express from "express";
import { cpfValidator } from "../utils/cpf-validator.util";
import { Athlete } from "../entities/athlete.entity";
import { AppDataSource } from "../database/config";

const router = express.Router();
const athleteRepository = AppDataSource.getRepository(Athlete);

router.post("/cpf", async (req, res) => {
  try {
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({
        valid: false,
        message: "CPF não fornecido",
      });
    }

    const cleanedCpf = cpf.replace(/[^\d]+/g, "");

    if (!cpfValidator.isValidCpf(cleanedCpf)) {
      return res.status(400).json({
        valid: false,
        message: "CPF inválido",
      });
    }

    const existingAthlete = await athleteRepository.findOneBy({
      cpf: cleanedCpf,
    });
    if (existingAthlete) {
      return res.status(400).json({
        valid: false,
        message: "Este CPF já está cadastrado",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "CPF válido",
    });
  } catch (error) {
    console.error("Erro na validação de CPF:", error);
    return res.status(500).json({
      valid: false,
      message: "Erro interno no servidor",
    });
  }
});

router.post("/email", async (req, res) => {
  const { email } = req.body;
  console.log('[API Email Validation] Received request for email:', email);

  try {
    if (!email) {
      console.log('[API Email Validation] No email provided');
      return res.status(200).json({
        valid: true,
        message: "Email não fornecido, opção sem email",
      });
    }

    console.log('[API Email Validation] Checking database for email');
    const existingEmail = await athleteRepository.findOneBy({ email });

    if (existingEmail) {
      console.log('[API Email Validation] Email already exists:', email);
      return res.status(200).json({ // Note: Changed to 200 since this is a validation response
        valid: false,
        message: "Email já cadastrado",
      });
    }

    console.log('[API Email Validation] Email is valid');
    return res.status(200).json({
      valid: true,
      message: "Email válido",
    });

  } catch (error) {
    console.error('[API Email Validation] Error:', error);
    return res.status(500).json({
      valid: false,
      message: "Erro interno no servidor",
    });
  }
});

router.post("/password", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        valid: false,
        message: "Senha não fornecida",
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        valid: false,
        message: "A senha deve ter no mínimo 6 caracteres, contendo pelo menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial.",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Senha válida",
    });

  } catch (error) {
    console.error("Erro na validação de senha: ", error);
    return res.status(500).json({
      valid: false,
      message: "Erro interno no servidor",
    });
  }
});
export default router;
