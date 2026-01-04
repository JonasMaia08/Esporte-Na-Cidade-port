import { describe, it, beforeEach, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { UserBase } from "../entities/user-base.entity";
import { AppDataSource } from "src/database/config";
import app from "../app";
import request from "supertest";
import { Roles } from "src/enums/roles.enum";

const BASE_URL = "/api/userbase/";

beforeEach(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }

    await AppDataSource.initialize();

    await AppDataSource.getRepository(UserBase).clear();

    const users = [
        {
            name: "Jane Doe",
            password: "securepassword456",
            cpf: "98765432100",
            rg: "87654321",
            birthday: "1985-05-15",
            phone: "+5511987654321",
            photo_url: "https://example.com/photos/janedoe.jpg",
            email: `janedoe-${Date.now()}@example.com`,
            role: Roles.ATHLETES
        },
        {
            name: "Old User",
            password: "oldpassword123",
            cpf: "12312312345",
            rg: "12345678",
            birthday: "1995-05-05",
            phone: "+5511988888888",
            photo_url: "https://example.com/photos/olduser.jpg",
            email: `olduser-${Date.now()}@example.com`,
            role: Roles.MANAGER
        }
    ];

    for (const user of users) {
        await AppDataSource.getRepository(UserBase).save(user);
    }
});


afterEach(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});


describe("Testing the User Base router", () => {

    describe("GET request", () => {
        it("should get all users", async () => {
            const res = await request(app)
                .get(BASE_URL)
                .expect("Content-Type", /json/)
                .expect(200);

            assert.ok(Array.isArray(res.body), "Resposta deveria ser um array de usuários");
        });

        it("should return error for invalid ID", async () => {
            const res = await request(app)
                .get("/api/userbase/-1")
                .expect("Content-Type", /json/)
                .expect(404);

            assert.strictEqual(res.status, 404, "Resposta deveria retornar código 400 para ID inválido");
        });
    });

    describe("POST request", () => {
        it("should create a new user with correct data", async () => {
            const newUser = {
                name: "Jane Doe",
                password: "securepassword456",
                cpf: "98765432100",
                rg: "87654321",
                birthday: "1985-05-15",
                phone: "+5511987654321",
                photo_url: "https://example.com/photos/janedoe.jpg",
                email: "janedoe@example.com"
            };

            const res = await request(app)
                .post(BASE_URL)
                .send(newUser)
                .expect("Content-Type", /json/)
                .expect(201);

            assert.ok(res.body.id, "Resposta deveria conter o ID do novo usuário");
            assert.strictEqual(res.body.name, newUser.name, "Nome do usuário não corresponde");
        });
    });

    describe("DELETE request", () => {
        it("should delete the user", async () => {
            const tempUser = {
                name: "Temporary User",
                password: "tempassword123",
                cpf: "11122334455",
                rg: "12345678",
                birthday: "2000-01-01",
                phone: "+5511999999999",
                photo_url: "https://example.com/photos/tempuser.jpg",
                email: "tempuser@example.com"
            };

            const createRes = await request(app)
                .post(BASE_URL)
                .send(tempUser)
                .expect(201);

            const userId = createRes.body.id;

            const deleteRes = await request(app)
                .delete(`/api/userbase/${userId}`)
                .expect(200);

            assert.strictEqual(deleteRes.status, 200, "Status de exclusão deveria ser 200");

            const getRes = await request(app)
                .get(`/api/userbase/${userId}`)
                .expect(404);

            assert.strictEqual(getRes.status, 404, "Usuário excluído deveria retornar 404");
        });
    });

    describe("PUT request", () => {
        it("should update the user details", async () => {
            const tempUser = {
                name: "Old User",
                password: "oldpassword123",
                cpf: "12312312345",
                rg: "12345678",
                birthday: "1995-05-05",
                phone: "+5511988888888",
                photo_url: "https://example.com/photos/olduser.jpg",
                email: "olduser@example.com"
            };

            const createRes = await request(app)
                .post(BASE_URL)
                .send(tempUser)
                .expect(201);

            const userId = createRes.body.id;

            const updatedUser = {
                name: "Updated User",
                password: "newpassword123",
                phone: "+5511990000000"
            };

            const updateRes = await request(app)
                .put(`/api/userbase/${userId}`)
                .send(updatedUser)
                .expect(200);

            assert.strictEqual(updateRes.body.name, updatedUser.name, "Nome não foi atualizado corretamente");
            assert.strictEqual(updateRes.body.phone, updatedUser.phone, "Telefone não foi atualizado corretamente");
        });
    });
});
