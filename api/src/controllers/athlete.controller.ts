import { Request, Response } from "express";
import { AppDataSource } from "../database/config";
import { Athlete } from "../entities/athlete.entity";
import { Address } from "../entities/address.entity";
import bcrypt from "bcrypt";

const athleteRepository = AppDataSource.getRepository(Athlete);
const addressRepository = AppDataSource.getRepository(Address);

export class AthleteController {
  static async getAll(req: Request, res: Response) {
    try {
      const athletes = await athleteRepository.find({where: {active: true}});
      res.status(200).json(athletes);
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
      res.status(500).json({ message: "Erro ao buscar atletas." });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }

      // Busca o atleta incluindo o endereço
      const athlete = await athleteRepository.findOne({
        where: { id, active: true },
        relations: ["address"]
      });
      if (!athlete) {
        return res.status(404).json({ message: "Atleta não encontrado." });
      }

      res.status(200).json(athlete);
    } catch (error) {
      console.error("Erro ao buscar atleta:", error);
      res.status(500).json({ message: "Erro ao buscar atleta." });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      
const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const athlete = athleteRepository.create({
        ...req.body,
        password: hashedPassword,
      });

      await athleteRepository.save(athlete);
      res.status(201).json(athlete);
    } catch (error) {
      console.error("Erro ao criar atleta:", error);
      res.status(500).json({ message: "Erro ao criar atleta." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }

      // Busque o atleta já com o address
      const athlete = await athleteRepository.findOne({
        where: { id, active: true },
        relations: ["address"]
      });
      if (!athlete) {
        return res.status(404).json({ message: "Atleta não encontrado." });
      }

      // Atualiza o endereço, se houver campos de endereço e se o atleta tiver address
      if (athlete.address) {
        if (req.body.estado !== undefined) athlete.address.state = req.body.estado;
        if (req.body.cidade !== undefined) athlete.address.city = req.body.cidade;
        if (req.body.bairro !== undefined) athlete.address.neighborhood = req.body.bairro;
        if (req.body.rua !== undefined) athlete.address.street = req.body.rua;
        if (req.body.numeroDaCasa !== undefined) athlete.address.number = parseInt(req.body.numeroDaCasa, 10);
        if (req.body.complemento !== undefined) athlete.address.complement = req.body.complemento;
        if (req.body.referencia !== undefined) athlete.address.references = req.body.referencia;
        await addressRepository.save(athlete.address);
      }

      // Atualiza os campos do atleta
      Object.assign(athlete, req.body);

      if (req.body.photo) {
        athlete.photo_url = req.body.photo;
      }
      if (req.body.password) {
        athlete.password = await bcrypt.hash(req.body.password, 10);
      }

      await athleteRepository.save(athlete);

      // Recarregue o atleta com address
      const updatedAthlete = await athleteRepository.findOne({
        where: { id, active: true },
        relations: ["address"]
      });

      res.status(200).json(updatedAthlete);
    } catch (error) {
      console.error("Erro ao atualizar atleta:", error);
      res.status(500).json({ message: "Erro ao atualizar atleta." });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }

      const athlete = await athleteRepository.findOneBy({ id });
      if (!athlete) {
        return res.status(404).json({ message: "Atleta não encontrado." });
      }

      athlete.active = false;
      await athleteRepository.save(athlete);
      res.status(200).json({ message: "Atleta deletado com sucesso." });
    } catch (error) {
      console.error("Erro ao deletar atleta:", error);
      res.status(500).json({ message: "Erro ao deletar atleta." });
    }
  }
}

