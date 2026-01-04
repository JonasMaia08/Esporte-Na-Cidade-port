import { describe, it, beforeEach, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import { Manager } from "../entities/manager.entity";
import { AppDataSource } from "../database/config";
import app from "../app";
import request from "supertest";
import { Roles } from "../enums/roles.enum";

const BASE_URL = "/api/manager/";

beforeEach(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }

    await AppDataSource.initialize();

    await AppDataSource.getRepository(Manager).clear();

    const managers = [
        {
            name: "Manager Jane",
            password: "securepassword456",
            cpf: "98765432100",
            rg: "87654321",
            birthday: "1985-05-15",
            phone: "+5511987654321",
            photo_url: "https://example.com/photos/managerjane.jpg",
            email: `managerjane-${Date.now()}@example.com`,
            role: Roles.MANAGER,
        },
        {
            name: "Manager John",
            password: "anothersecurepassword123",
            cpf: "12345678900",
            rg: "12345678",
            birthday: "1990-07-20",
            phone: "+5511976543210",
            photo_url: "https://example.com/photos/managerjohn.jpg",
            email: `managerjohn-${Date.now()}@example.com`,
            role: Roles.MANAGER,
        },
    ];

    for (const manager of managers) {
        await AppDataSource.getRepository(Manager).save(manager);
    }
});

afterEach(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

describe("Testing the Manager router", () => {
    describe("GET request", () => {
        it("should get all managers", async () => {
            const res = await request(app)
                .get(BASE_URL)
                .expect("Content-Type", /json/)
                .expect(200);

            assert.ok(Array.isArray(res.body), "Resposta deveria ser um array de gerentes");
        });

        it("should return error for invalid ID", async () => {
            const res = await request(app)
                .get(`${BASE_URL}-1`)
                .expect("Content-Type", /json/)
                .expect(404);

            assert.strictEqual(res.status, 404, "Resposta deveria retornar código 404 para ID inválido");
        });
    });

    describe("POST request", () => {
        it("should create a new manager with correct data", async () => {
            const newManager = {
                name: "New Manager",
                password: "newsecurepassword123",
                cpf: "11122233344",
                rg: "98765432",
                birthday: "1980-01-01",
                phone: "+5511999999999",
                photo_url: "https://example.com/photos/newmanager.jpg",
                email: "newmanager@example.com",
            };

            const res = await request(app)
                .post(BASE_URL)
                .send(newManager)
                .expect("Content-Type", /json/)
                .expect(201);

            assert.ok(res.body.id, "Resposta deveria conter o ID do novo gerente");
            assert.strictEqual(res.body.name, newManager.name, "Nome do gerente não corresponde");
        });
    });

    describe("DELETE request", () => {
        it("should delete a manager", async () => {
            const tempManager = {
                name: "Temporary Manager",
                password: "tempsecurepassword123",
                cpf: "55566677788",
                rg: "11223344",
                birthday: "1985-08-25",
                phone: "+5511988888888",
                photo_url: "https://example.com/photos/tempmanager.jpg",
                email: "tempmanager@example.com",
            };

            const createRes = await request(app)
                .post(BASE_URL)
                .send(tempManager)
                .expect(201);

            const managerId = createRes.body.id;

            const deleteRes = await request(app)
                .delete(`${BASE_URL}${managerId}`)
                .expect(200);

            assert.strictEqual(deleteRes.status, 200, "Status de exclusão deveria ser 200");

            const getRes = await request(app)
                .get(`${BASE_URL}${managerId}`)
                .expect(404);

            assert.strictEqual(getRes.status, 404, "Gerente excluído deveria retornar 404");
        });
    });

    describe("PUT request", () => {
        it("should update the manager details", async () => {
            const tempManager = {
                name: "Old Manager",
                password: "oldpassword123",
                cpf: "11122334455",
                rg: "11223344",
                birthday: "1985-07-01",
                phone: "+5511998887777",
                photo_url: "https://example.com/photos/oldmanager.jpg",
                email: "oldmanager@example.com",
            };

            const createRes = await request(app)
                .post(BASE_URL)
                .send(tempManager)
                .expect(201);

            const managerId = createRes.body.id;

            const updatedManager = {
                name: "Updated Manager",
                password: "newpassword123",
                phone: "+5511999999999",
            };

            const updateRes = await request(app)
                .put(`${BASE_URL}${managerId}`)
                .send(updatedManager)
                .expect(200);

            assert.strictEqual(updateRes.body.name, updatedManager.name, "Nome não foi atualizado corretamente");
            assert.strictEqual(updateRes.body.phone, updatedManager.phone, "Telefone não foi atualizado corretamente");
        });
    });
});
