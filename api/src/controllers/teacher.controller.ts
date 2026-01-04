import { Request, Response } from "express";
import { AppDataSource } from "../database/config";
import { Teacher } from "../entities/teacher.entity";
import { Modality } from "../entities/modality.entity";
import { Roles } from "../enums/roles.enum";
import bcrypt from "bcrypt";

const teacherRepository = AppDataSource.getRepository(Teacher);

export class TeacherController {
  static async getAll(req: Request, res: Response) {
    try {
      const teachers = await teacherRepository.find({
        relations: ["modality"],
      });
      res.json(teachers);
    } catch (error) {
      console.error("Erro ao buscar professores:", error.message);
      res.status(500).json({ message: "Erro ao buscar professores.", error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const teacherId = parseInt(req.params.id, 10);

      if (isNaN(teacherId)) {
        return res.status(400).json("ID de professor inválido.");
      }

      const teacher = await teacherRepository.findOneBy({ id: teacherId });
      if (!teacher) {
        return res.status(404).json("Professor não encontrado.");
      }

      console.log("[TeacherController.getById] Sending teacher data:", JSON.stringify(teacher)); // ADD THIS LOG
      res.status(200).json(teacher);
    } catch (error) {
      console.error("Erro ao buscar professor:", error);
      res.status(500).json("Erro ao buscar professor.");
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { id, password, ...otherFields } = req.body;
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const teacher = teacherRepository.create({
        ...otherFields,
        role: Roles.TEACHER,
        password: hashedPassword
      });
      
      await teacherRepository.save(teacher);
      res.status(201).json(teacher);
    } catch (error) {
      
      res.status(500).json("Erro ao criar professor.");
    }
  }

  static async update(req: Request, res: Response) {
    console.log('=== INÍCIO DA ATUALIZAÇÃO DO PROFESSOR ===');
    console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    try {
      const teacherId = parseInt(req.params.id, 10);
      console.log(`Buscando professor com ID: ${teacherId}`);

      if (isNaN(teacherId)) {
        console.error('ID de professor inválido:', req.params.id);
        return res.status(400).json("ID de professor inválido.");
      }

      // Busca o professor com a relação de modalidade
      const teacher = await teacherRepository.findOne({
        where: { id: teacherId },
        relations: ["modality"]
      });
      
      if (!teacher) {
        console.error('Professor não encontrado com ID:', teacherId);
        return res.status(404).json("Professor não encontrado.");
      }

      console.log('Professor encontrado:', JSON.stringify(teacher, null, 2));

      // Atualiza os campos básicos
      teacher.name = req.body.name || teacher.name;
      teacher.cpf = req.body.cpf || teacher.cpf;
      teacher.rg = req.body.rg || teacher.rg;
      teacher.birthday = req.body.birthday || teacher.birthday;
      teacher.phone = req.body.phone || teacher.phone;
      teacher.photo_url = req.body.photo_url || teacher.photo_url;
      teacher.email = req.body.email || teacher.email;
      teacher.about = req.body.about || teacher.about;

      // Atualiza a senha se fornecida
      if (req.body.password) {
        console.log('Atualizando senha do professor');
        teacher.password = await bcrypt.hash(req.body.password, 10);
      }

      // Atualiza a modalidade se fornecida
      if (req.body.modality) {
        console.log('Dados da modalidade recebidos:', JSON.stringify(req.body.modality, null, 2));
        const modalityId = req.body.modality.id || req.body.modality;
        console.log(`Buscando modalidade com ID: ${modalityId}`);
        
        try {
          const modality = await AppDataSource.getRepository(Modality).findOne({
            where: { id: modalityId }
          });
          
          if (modality) {
            console.log('Modalidade encontrada:', JSON.stringify(modality, null, 2));
            teacher.modality = modality;
            console.log('Modalidade atribuída ao professor');
          } else {
            console.warn(`Modalidade com ID ${modalityId} não encontrada`);
          }
        } catch (error) {
          console.error('Erro ao buscar modalidade:', error);
        }
      } else {
        console.log('Nenhuma modalidade fornecida no corpo da requisição');
      }

      console.log('Professor antes de salvar:', JSON.stringify(teacher, null, 2));
      
      try {
        console.log('Salvando alterações no banco de dados...');
        await teacherRepository.save(teacher);
        console.log('Alterações salvas com sucesso');
        
        // Recarrega o professor com a relação de modalidade atualizada
        console.log('Buscando dados atualizados do professor...');
        const updatedTeacher = await teacherRepository.findOne({
          where: { id: teacherId },
          relations: ["modality"]
        });
        
        if (updatedTeacher) {
          console.log('Dados atualizados do professor:', JSON.stringify(updatedTeacher, null, 2));
          console.log('Tipo da modalidade no professor atualizado:', typeof updatedTeacher.modality);
          console.log('=== FIM DA ATUALIZAÇÃO DO PROFESSOR (SUCESSO) ===');
          return res.status(200).json(updatedTeacher);
        } else {
          console.error('Erro ao buscar dados atualizados do professor');
          console.log('=== FIM DA ATUALIZAÇÃO DO PROFESSOR (ERRO) ===');
          return res.status(500).json("Erro ao buscar dados atualizados do professor.");
        }
      } catch (saveError) {
        console.error('Erro ao salvar alterações:', saveError);
        console.log('=== FIM DA ATUALIZAÇÃO DO PROFESSOR (ERRO) ===');
        return res.status(500).json("Erro ao salvar alterações no banco de dados.");
      }
    } catch (error) {
      console.error("Erro ao atualizar professor:", error);
      res.status(500).json("Erro ao atualizar professor.");
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const teacherId = parseInt(req.params.id, 10);

      if (isNaN(teacherId)) {
        return res.status(400).json("ID de professor inválido.");
      }

      const teacher = await teacherRepository.findOneBy({ id: teacherId });
      if (!teacher) {
        return res.status(404).json("Professor não encontrado.");
      }

      await teacherRepository.remove(teacher);
      res.status(200).json("Professor deletado com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar professor:", error);
      res.status(500).json("Erro ao deletar professor.");
    }
  }
}