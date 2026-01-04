import express, { Router, Request, Response } from "express";
import { AppDataSource } from "../database/config";
import { Athlete } from "../entities/athlete.entity";
import { Roles } from "../enums/roles.enum";
import bcrypt from "bcrypt";
import { fieldValidators } from "../utils/field-validator.util";
import { Address } from "../entities/address.entity";
import { Log } from "../utils/personalizedLogs.util"; // Import your Log utility

const router = express.Router();
const athleteRepository = AppDataSource.getRepository(Athlete);
const adressRepository = AppDataSource.getRepository(Address);

router.post("/", async (req: Request, res: Response) => {
  Log.info(`Starting athlete registration process`);
  Log.debug(`Request body: ${JSON.stringify(req.body, null, 2)}`);

  try {
    const {
      name,
      cpf,
      rg,
      birthday,
      phone,
      athletePhotoUrl,
      email,
      password,
      fatherName,
      fatherPhoneNumber,
      fatherCpf,
      fatherEmail,
      motherName,
      motherPhoneNumber,
      motherCpf,
      motherEmail,
      responsibleName,
      responsibleEmail,
      responsibleCpf,
      bloodType,
      frontIdPhotoUrl,
      backIdPhotoUrl,
      foodAllergies,
      estado,
      cidade,
      bairro,
      rua,
      numeroDaCasa,
      complemento,
      referencia,
    } = req.body;

    const sanitizedEmail = email && email.trim() !== "" ? email : null;
    // Field validation
    Log.info("Validating required fields");
    const requiredFields = {
      name,
      cpf,
      rg,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        Log.error(`Missing required field: ${field}`);
        return res
          .status(400)
          .json({ message: `Campo ${field} é obrigatório` });
      }
    }

    if (email) {
      Log.debug("Checking email format");
      if (!fieldValidators.isEmailValid(email)) {
        Log.error(`Invalid email format: ${email}`);
        return res.status(400).json({ message: "Formato de email inválido" });
      }

      // Verifica se o email já existe
      Log.debug("Checking if email already exists");
      const existingEmail = await athleteRepository.findOneBy({ email });
      if (existingEmail) {
        Log.error(`Email already registered: ${email}`);
        return res.status(400).json({ message: "Email já cadastrado" });
      }
    }
    // Password hashing
    Log.info("Hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);
    Log.debug("Password hashed successfully");

    // Address creation
    Log.info("Creating address record");
    const newAddress = adressRepository.create({
      state: estado,
      city: cidade,
      neighborhood: bairro,
      street: rua,
      number: parseInt(numeroDaCasa, 10),
      complement: complemento,
      references: referencia,
    });

    await adressRepository.save(newAddress);
    Log.success(`Address created with ID: ${newAddress.id}`);

    // Athlete creation
    Log.info("Creating athlete record");
    const newAthlete = athleteRepository.create({
      name,
      password: hashedPassword,
      cpf,
      rg,
      birthday,
      phone,
      photo_url: athletePhotoUrl,
      email: sanitizedEmail,
      father_name: fatherName,
      father_phone: fatherPhoneNumber,
      father_cpf: fatherCpf,
      father_email: fatherEmail,
      mother_name: motherName,
      mother_phone: motherPhoneNumber,
      mother_cpf: motherCpf,
      mother_email: motherEmail,
      responsible_person_name: responsibleName,
      responsible_person_email: responsibleEmail,
      responsible_person_cpf: responsibleCpf,
      blood_type: bloodType,
      photo_url_cpf_front: frontIdPhotoUrl,
      photo_url_cpf_back: backIdPhotoUrl,
      allergy: foodAllergies,
      role: Roles.ATHLETES,
      address: newAddress,
    });

    await athleteRepository.save(newAthlete);
    Log.success(`Athlete created with ID: ${newAthlete.id}`);

    res.status(201).json({
      message: "Atleta cadastrado com sucesso!",
      athlete: newAthlete,
    });
    Log.success("Athlete registration completed successfully");
  } catch (error) {
    Log.error(
      `Error during athlete registration: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    Log.debug(
      `Error stack: ${
        error instanceof Error ? error.stack : "No stack trace available"
      }`
    );
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

export default router;
