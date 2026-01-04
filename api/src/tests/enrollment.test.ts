import test, { describe, beforeEach, after, it, before } from "node:test";
import { AppDataSource } from "src/database/config";
import { Athlete } from "src/entities/athlete.entity";
import { Modality } from "src/entities/modality.entity";
import { Enrollment } from "src/entities/enrollment.entity";
import { createPlaceholderAthletes } from "./helper/createPlaceholderAthletes";
import { createPlaceholderModalities } from "./helper/createPlaceholderModalities";
import { createPlaceholderEnrollments } from "./helper/createPlaceholderEnrollments";
import assert from "node:assert"
import request from "supertest";
import app from "src/app";
import { createPlaceholderTeachers } from "./helper/createPlaceholderTeacher";
import { Teacher } from "src/entities/teacher.entity";
import { teachersPlaceholder } from "./helper/data";

const BASE_URL = "/api/enrollment";

const athleteRepository = AppDataSource.getRepository(Athlete);
const modalityRepository = AppDataSource.getRepository(Modality);
const enrollmentRepository = AppDataSource.getRepository(Enrollment);
const teacherRepository = AppDataSource.getRepository(Teacher);

let token: string;
let teacherToken: string;

before(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }

    await AppDataSource.initialize();
})

beforeEach(async () => {
    await AppDataSource.synchronize(true);

    await enrollmentRepository.clear();
    await modalityRepository.clear();
    await athleteRepository.clear();
    await teacherRepository.clear();

    await createPlaceholderAthletes();
    await createPlaceholderModalities();
    await createPlaceholderEnrollments();
    await createPlaceholderTeachers();

    const user = {
        credentials: {
            cpf: "111.222.333-44",
            password: "securepassword123"
        },
        type: "athlete"
    };

    const teacher = {
        credentials: {
            email: "john.smith@example.com",
            password: "123456"
        },
        type: "teacher"
    };

    // Athlete Login

    const responseLogin = await request(app)
        .post("/api/auth/login")
        .send(user)
        .expect(200)
        .expect("Content-Type", /json/);

    token = responseLogin.body.accessToken;
    assert(token, "Access token not received");

    // Teacher Login
    
    const teacherLogin = await request(app)
        .post("/api/auth/login")
        .send(teacher)
        .expect(200)
        .expect("Content-Type", /json/);

    teacherToken = teacherLogin.body.accessToken;
    assert(teacherToken, "Teacher access token not received");
});

after(async () => {
    await AppDataSource.destroy();
})

describe("testing enrollment", () => {
    it("should create a new enrollment", async () => {
        const athletes = await athleteRepository.find();
        const modalities = await modalityRepository.find();

        const athleteId = athletes[0].id;
        const modalityId = modalities[0].id;

        const [_, countBefore] = await enrollmentRepository.findAndCount();

        const response = await request(app)
            .post(BASE_URL)
            .set("Authorization", `Bearer ${token}`)
            .send(
                {
                    athleteId,
                    modalityId
                }
            )
            .expect(201)
            .expect('Content-Type', /json/);

        const newEnrollment = response.body;

        assert.strictEqual(newEnrollment.modality.id, modalityId);
        assert.strictEqual(newEnrollment.athlete.id, athleteId);

        const [__, countAfter] = await enrollmentRepository.findAndCount();

        assert.notStrictEqual(countBefore, countAfter);
    });
    it("should return all approved enrollments from an Athlete", async () => {
        const athletes = await athleteRepository.find();
        const athlete = athletes[0];

        const enrollments = await enrollmentRepository.find({ where: { athlete: athlete, approved: true, active: true } });

        const response = await request(app)
            .get(`${BASE_URL}?approved=true&active=true`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        const receivedEnrollments = response.body;

        assert.notEqual(enrollments.length, 0);
        assert.equal(receivedEnrollments[0].id, enrollments[0].id);
        assert.equal(receivedEnrollments.length, enrollments.length);
    })
    it("should return all reproved enrollments from an Athlete", async () => {
        const athletes = await athleteRepository.find();
        const athlete = athletes[0];

        const enrollments = await enrollmentRepository.find({ where: { athlete: athlete, approved: false, active: true } });

        const response = await request(app)
            .get(`${BASE_URL}?approved=false&active=true`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        const receivedEnrollments = response.body;

        assert.notEqual(enrollments.length, 0);
        assert.equal(receivedEnrollments.length, enrollments.length);
        assert.equal(receivedEnrollments[0].id, enrollments[0].id);
    })
    it("should return all approved enrolments", async () => {
        const dbEnrollements = await enrollmentRepository.findBy({ approved: true });

        const response = await request(app)
            .get(`${BASE_URL}?approved=true`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        const receivedEnrollments = response.body;

        assert.equal(receivedEnrollments.length, dbEnrollements.length);
    })
    it("should return all enrollments from a student", async () => {
        const dbEnrollements = await enrollmentRepository.find();

        const response = await request(app)
            .get(`${BASE_URL}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        const receivedEnrollments = response.body;

        assert.equal(receivedEnrollments.length, dbEnrollements.length);
    })
    it("should return all enrollments from a teacher's modality", {only: true}, async () => {
        const dbEnrollements = await enrollmentRepository.find({
            where: {
                modality: { 
                    id: teachersPlaceholder[0].modality.id
                }
            }
        });

        const response = await request(app)
            .get(`${BASE_URL}`)
            .set("Authorization", `Bearer ${teacherToken}`)
            .expect(200)
            .expect('Content-Type', /json/);

        const receivedEnrollments = response.body;

        assert.equal(receivedEnrollments.length, dbEnrollements.length);
    })    
    it("should approve an enrollment as a teacher", { only: true }, async () => {
        const enrollments = await enrollmentRepository.find({ where: { approved: false } });
        const enrollment = enrollments[0];

        const response = await request(app)
            .put(`${BASE_URL}/approve/${enrollment.id}`)
            .set("Authorization", `Bearer ${teacherToken}`)
            .expect(200)
            .expect('Content-Type', /json/);

        const updatedEnrollment = response.body;

        assert.equal(updatedEnrollment.approved, true);
        assert.notEqual(updatedEnrollment, enrollment);
    })
    it("should delete an enrollment", async () => {
        const enrollments = await enrollmentRepository.find();
        const enrollment = enrollments[0];

        await request(app)
            .delete(`${BASE_URL}/${enrollment.id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        const enrollmentsAfter = await enrollmentRepository.find();

        assert.notEqual(enrollments.length, enrollmentsAfter.length);
    })
})