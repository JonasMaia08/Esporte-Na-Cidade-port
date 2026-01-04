import { AppDataSource } from "src/database/config";
import { Teacher } from "src/entities/teacher.entity";
import { teachersPlaceholder } from "./data";
import bcrypt from "bcrypt";

const teacherRepository = AppDataSource.getRepository(Teacher);

export const createPlaceholderTeachers = async () => {
  for (const teacherData of teachersPlaceholder) {
    const hashedPassword = await bcrypt.hash(teacherData.password, 10);

    const newTeacher = teacherRepository.create({...teacherData, password: hashedPassword });

    await teacherRepository.save(newTeacher);
  }
};
