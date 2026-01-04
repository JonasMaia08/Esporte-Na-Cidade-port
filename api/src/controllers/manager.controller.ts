import { Request, Response } from "express";
import { AppDataSource } from "../database/config";
import { Manager } from "../entities/manager.entity";

export class ManagerController {
  static async list(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Manager);
    const managers = await repo.find();
    return res.json(managers);
  }

  static async getById(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Manager);
    const manager = await repo.findOne({ where: { id: Number(req.params.id) } });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.json(manager);
  }

  static async create(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Manager);
    try {
      const manager = repo.create(req.body);
      await repo.save(manager);
      return res.status(201).json(manager);
    } catch (err) {
      return res.status(400).json({ message: "Error creating manager", error: err });
    }
  }

  static async update(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Manager);
    const manager = await repo.findOne({ where: { id: Number(req.params.id) } });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    Object.assign(manager, req.body);
    await repo.save(manager);
    return res.json(manager);
  }

  static async delete(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Manager);
    const manager = await repo.findOne({ where: { id: Number(req.params.id) } });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    await repo.remove(manager);
    return res.status(204).send();
  }
}
