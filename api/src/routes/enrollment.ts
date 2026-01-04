import express, { Request, Response } from "express";
import { AppDataSource } from "../database/config";
import { Athlete } from "../entities/athlete.entity";
import { Modality } from "../entities/modality.entity";
import { Enrollment } from "../entities/enrollment.entity";
import { EnrollmentLog } from "../entities/enrollmentLog.entity";
import { logEnrollmentChange } from "./enrollmentLog.util";
import { authentication } from "../middleware/auth.middleware";
import { JwtPayload } from 'jsonwebtoken';
import { Roles } from "../enums/roles.enum";
import { Teacher } from "../entities/teacher.entity";

const router = express.Router();
const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const teacherRepository = AppDataSource.getRepository(Teacher);
const modalityRepository = AppDataSource.getRepository(Modality);

interface AuthRequest extends Request {
    user?: string | JwtPayload;
}

router.post("/", authentication, async (req: AuthRequest, res: Response) => {
    try {
        console.log('ENROLLMENT POST - REQ.USER:', req.user);
        console.log('ENROLLMENT POST - BODY:', req.body);
        const { modalityId } = req.body;

        const athlete = await AppDataSource.getRepository(Athlete).findOneBy({ id: req.user.id });
        const modality = await AppDataSource.getRepository(Modality).findOneBy({ id: modalityId });

        console.log('ENROLLMENT POST - ATHLETE:', athlete);
        console.log('ENROLLMENT POST - MODALITY:', modality);

        if (!athlete || !modality) {
            console.log('ENROLLMENT POST - athlete ou modality não encontrada');
            return res.status(400).json({ message: "Athlete ou modalidade não encontrada." });
        }

        const enrollment = enrollmentRepository.create({
            athlete,
            modality,
            active: true,
            approved: false,
        });
        await enrollmentRepository.save(enrollment);

        console.log('ENROLLMENT POST - ENROLLMENT SALVO:', enrollment);
        res.status(201).json(enrollment);
    } catch (error) {
        console.error("error message", error);
        res.status(500).json({ message: "error message", error: error.message });
    }
});

router.get("/", authentication, async (req: AuthRequest, res: Response) => {
    try {
        const query = req.query;

        const where: any = {};

        // Filtro seguro por atleta
        if (query.athleteId) {
            where.athlete = { id: Number(query.athleteId) };
        } else if (req.user.role == Roles.ATHLETES) {
            where.athlete = { id: Number(req.user.id) };
        }

        if (req.user.role == Roles.TEACHER) {
            const teacher = await teacherRepository.findOne({ 
                where: { id: req.user.id },
                relations: ['modality']
            });
            where.modality = { id: Number(teacher?.modality.id) };
        }

        // Só filtra se vier explicitamente como 'true' ou 'false'
        if (query.approved === 'true' || query.approved === 'false') {
            where.approved = query.approved === 'true';
        }
        if (query.active === 'true' || query.active === 'false') {
            where.active = query.active === 'true';
        }

        const enrollments = await enrollmentRepository.find({
            where,
            relations: ['athlete', 'modality']
        });

        // Log para depuração: mostrar status active de cada enrollment
        console.log('ENROLLMENTS GET - ACTIVE STATUS:', enrollments.map(e => ({ id: e.id, active: e.active, approved: e.approved })));

        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/:id", authentication, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const query = req.query;

        const where: any = { id: Number(id) };

        if (query.approved !== null && query.approved !== undefined) {
            where.approved = query.approved === 'true';
        }

        const enrollment = await enrollmentRepository.findOne({
            where,
            relations: ['athlete', 'modality']
        });

        if (!enrollment) {
            return res.status(404).json({ message: "Inscrição não encontrada" });
        }

        // Log para depuração: mostrar status active do enrollment
        console.log('ENROLLMENTS GET BY ID - ACTIVE STATUS:', { id: enrollment.id, active: enrollment.active, approved: enrollment.approved });
        res.status(200).json([enrollment]);  // Wrap in array
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", authentication, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { approved, active } = req.body;

        const enrollment = await enrollmentRepository.findOne({
            where: { id: Number(id) },
            relations: ['athlete', 'modality']
        });

        if (!enrollment) {
            return res.status(404).json({ message: "Inscrição não encontrada" });
        }

        // Store old values
        const oldApproved = enrollment.approved;
        const oldActive = enrollment.active;

        let hasChange = false;
        let eventType = '';
        let eventDescription = '';
        let oldValue: any = {};
        let newValue: any = {};

        // Compare and set approved
        if (typeof approved === 'boolean' && approved !== oldApproved) {
            hasChange = true;
            eventType = approved ? 'approved' : 'disapproved';
            eventDescription = approved ? 'Inscrição aprovada' : 'Inscrição reprovada';
            oldValue.approved = oldApproved;
            newValue.approved = approved;
            enrollment.approved = approved;
        }
        // Compare and set active
        if (typeof active === 'boolean' && active !== oldActive) {
            hasChange = true;
            eventType = active ? 'activated' : 'deactivated';
            eventDescription = active ? 'Inscrição ativada' : 'Inscrição desativada';
            oldValue.active = oldActive;
            newValue.active = active;
            enrollment.active = active;
        }

        await enrollmentRepository.save(enrollment);

        // Log only if there was a relevant change
        if (hasChange) {
            await logEnrollmentChange({
                enrollment,
                athlete: enrollment.athlete,
                changedBy: req.user.id,
                eventType,
                eventDescription,
                oldValue,
                newValue
            });
        }

        res.status(200).json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", authentication, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await enrollmentRepository.delete(id);

        res.status(200).json({ message: "The enrollment was successfully deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/approve/:id", authentication, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.role != Roles.TEACHER) {
            res.status(401).json({ error: "You don't have access rights to use this feature." });
            return;
        }

        const { id } = req.params;

        const enrollment = await enrollmentRepository.findOne({
            where: { id: Number(id) },
            relations: ['athlete', 'modality']
        });

        if (!enrollment) {
            return res.status(404).json({ message: "Inscrição não encontrada" });
        }

        const oldApproved = enrollment.approved;
        if (!oldApproved) {
            enrollment.approved = true;
            await enrollmentRepository.save(enrollment);

            await logEnrollmentChange({
                enrollment,
                athlete: enrollment.athlete,
                changedBy: req.user.id,
                eventType: 'approved',
                eventDescription: 'Inscrição aprovada',
                oldValue: { approved: oldApproved },
                newValue: { approved: true }
            });
        }

        res.status(200).json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router;
