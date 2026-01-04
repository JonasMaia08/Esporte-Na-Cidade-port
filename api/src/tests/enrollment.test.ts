import test, { describe, it, beforeEach, before, after } from "node:test";
import { AppDataSource } from "../database/config";
import { Athlete } from "src/entities/athlete.entity";
import { Modality } from "src/entities/modality.entity";
import request from "supertest";
import app from "src/app";
import { Roles } from "src/enums/roles.enum";

const BASE_URL = "/api/teacher/";

const userRepository = AppDataSource.getRepository(Athlete);
const modalityRepository = AppDataSource.getRepository(Modality);

beforeEach(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    await userRepository.clear();
    await modalityRepository.clear();

    const modalidades = [
        modalityRepository.create({
            name: "Futebol",
            description: "Um esporte coletivo jogado com uma bola esférica.",
            days_of_week: ["Segunda-feira", "Quarta-feira", "Sexta-feira"],
            start_time: "15:00",
            end_time: "17:00",
            class_locations: ["Campo A", "Campo B"],
        }),
        modalityRepository.create({
            name: "Basquete",
            description: "Um esporte jogado por duas equipes que tentam marcar pontos arremessando a bola em uma cesta.",
            days_of_week: ["Terça-feira", "Quinta-feira"],
            start_time: "16:00",
            end_time: "18:00",
            class_locations: ["Ginásio"],
        }),
    ];

    const atletas = [
        userRepository.create({
            name: "João Silva",
            password: "securepassword123",
            cpf: "111.222.333-44",
            rg: "12.345.678-9",
            birthday: "2005-06-15",
            phone: "123456789",
            photo_url: "https://example.com/photo/joao_silva.jpg",
            email: "joao.silva@example.com",
            role: Roles.ATHLETES,

            father_name: "João Silva Sr.",
            father_phone: "123456789",
            father_cpf: "111.222.333-44",
            father_email: "joao.silva.sr@example.com",
            mother_name: "Maria Silva",
            mother_phone: "987654321",
            mother_cpf: "555.666.777-88",
            mother_email: "maria.silva@example.com",
            responsible_person_name: "Responsável Silva",
            responsible_person_email: "responsavel.silva@example.com",
            responsible_person_cpf: "999.888.777-66",
            blood_type: "O+",
            allergy: "Nenhuma",
            modalities: [modalidades[0]],
            addresses: [],
        }),
        userRepository.create({
            name: "Carlos Santos",
            password: "securepassword456",
            cpf: "444.555.666-77",
            rg: "87.654.321-0",
            birthday: "2007-09-23",
            phone: "111222333",
            photo_url: "https://example.com/photo/carlos_santos.jpg",
            email: "carlos.santos@example.com",
            role: Roles.ATHLETES,

            father_name: "Carlos Santos Sr.",
            father_phone: "111222333",
            father_cpf: "444.555.666-77",
            father_email: "carlos.santos.sr@example.com",
            mother_name: "Ana Santos",
            mother_phone: "222333444",
            mother_cpf: "777.888.999-00",
            mother_email: "ana.santos@example.com",
            responsible_person_name: "Responsável Santos",
            responsible_person_email: "responsavel.santos@example.com",
            responsible_person_cpf: "666.555.444-33",
            blood_type: "A-",
            allergy: "Amendoim",
            modalities: [modalidades[1]],
            addresses: [],
        }),
    ];

    await modalityRepository.save(modalidades);
    await userRepository.save(atletas);
});

after(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

describe("testing enrollment subscription", () => {
    test("subscription can successfully be made", async () => {
        const athletes = await userRepository.find();
        const modalities = await modalityRepository.find();

        const athleteId = athletes[0].id;
        const modalityId = modalities[0].id;

        console.log("\n\n");
        console.log(athleteId);
        console.log(modalityId);
        console.log("\n\n");

        request(app)
            .post(`/api/enrollment`)
            .send(
                {
                    athleteId,
                    modalityId
                }
            )
            .expect('Content-Type', /json/)
            .expect(201)
    });
})