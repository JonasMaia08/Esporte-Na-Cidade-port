import { AppDataSource } from "src/database/config";
import { Athlete } from "src/entities/athlete.entity";
import { athletesPlaceholder } from "./data";
import bcrypt from "bcrypt"; 


const athleteRepository = AppDataSource.getRepository(Athlete);

export const createPlaceholderAthletes = async () => {
    for (var athlete of athletesPlaceholder) {
        const hashedPassword = await bcrypt.hash(athlete.password, 10);

        const newAthlete = athleteRepository.create({ ...athlete, password: hashedPassword });

        await athleteRepository.save(newAthlete);
    }
}