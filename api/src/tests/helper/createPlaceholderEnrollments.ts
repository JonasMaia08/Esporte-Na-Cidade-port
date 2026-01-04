import { AppDataSource } from "src/database/config";
import { Athlete } from "src/entities/athlete.entity";
import { Enrollment } from "src/entities/enrollment.entity";
import { Modality } from "src/entities/modality.entity";
import { enrollmentsPlaceholder } from "./data";

const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const modalityRepository = AppDataSource.getRepository(Modality);
const athleteRepository = AppDataSource.getRepository(Athlete);

export const createPlaceholderEnrollments = async () => {
    const modalities = await modalityRepository.find();
    const athletes = await athleteRepository.find();

    for (let i = 0; i < 2; i++) {
        const newEnrollment = enrollmentRepository.create(enrollmentsPlaceholder[i]);

        newEnrollment.athlete = athletes[0];
        newEnrollment.modality = modalities[i];

        await enrollmentRepository.save(newEnrollment);
    }
}