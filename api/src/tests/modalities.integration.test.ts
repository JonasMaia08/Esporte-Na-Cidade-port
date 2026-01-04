import request from "supertest";
import { AppDataSource } from "../database/config";
import { Modality } from "../entities/modality.entity";
import { Enrollment } from "../entities/enrollment.entity";
import { Athlete } from "../entities/athlete.entity";
import { Atendiment } from "../entities/atendiment.entity";
import app from "../app";

jest.mock("../database/config");

describe("Modality Routes", () => {
  beforeAll(async () => {
    AppDataSource.getRepository = jest.fn().mockImplementation((entity) => {
      if (entity === Modality) return modalityRepositoryMock;
      if (entity === Enrollment) return enrollmentRepositoryMock;
      if (entity === Athlete) return athleteRepositoryMock;
      if (entity === Atendiment) return atendimentRepositoryMock;
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const modalityRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const enrollmentRepositoryMock = {
    find: jest.fn(),
  };

  const athleteRepositoryMock = {
    findOne: jest.fn(),
  };

  const atendimentRepositoryMock = {
    insert: jest.fn().mockResolvedValue({}),
  };

  describe("GET /modalities/:id/athletes-availible", () => {
    it("should return available athletes for a modality", async () => {
      const mockModality = {
        id: 1,
        name: "Test Modality",
        enrollments: [
          {
            athlete: {
              id: 1,
              name: "Test Athlete",
              cpf: "12345678901",
            },
          },
        ],
      };

      modalityRepositoryMock.find.mockResolvedValue([mockModality]);

      const response = await request(app)
        .get("/modalities/1/athletes-availible")
        .expect(200);

      expect(response.body).toEqual({
        athletes_availible: [mockModality],
      });
      expect(modalityRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          id: 1,
          enrollments: {
            active: true,
            approved: true,
          },
        },
        select: {
          enrollments: {
            athlete: {
              name: true,
              cpf: true,
              id: true,
            },
          },
          name: true,
          id: true,
        },
        order: {
          enrollments: {
            athlete: {
              name: "ASC",
            },
          },
        },
        relations: ["enrollments", "enrollments.athlete"],
      });
    });

    it("should return 404 if modality not found", async () => {
      modalityRepositoryMock.find.mockResolvedValue([]);

      const response = await request(app)
        .get("/modalities/999/athletes-availible")
        .expect(200);

      expect(response.body).toEqual({ athletes_availible: [] });
    });
  });

  describe("POST /modalities/:id/receive-atendiments", () => {
    it("should create atendiments successfully", async () => {
      const atendiments = [
        {
          modalityId: 1,
          athleteId: 1,
          present: true,
        },
      ];

      const response = await request(app)
        .post("/modalities/1/receive-atendiments")
        .send(atendiments)
        .expect(201);

      expect(response.body).toEqual({
        message: "Atendimentos registrados com sucesso.",
      });
      expect(atendimentRepositoryMock.insert).toHaveBeenCalledWith(atendiments);
    });

    it("should return 400 for invalid payload", async () => {
      const invalidAtendiments = [
        {
          modalityId: "not-a-number",
          athleteId: 1,
          present: "not-a-boolean",
        },
      ];

      const response = await request(app)
        .post("/modalities/1/receive-atendiments")
        .send(invalidAtendiments)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 for atendiments with wrong modality", async () => {
      const atendiments = [
        {
          modalityId: 2, // Diferente do ID na URL
          athleteId: 1,
          present: true,
        },
      ];

      const response = await request(app)
        .post("/modalities/1/receive-atendiments")
        .send(atendiments)
        .expect(400);

      expect(response.body.message).toContain("modalidades diferentes");
    });
  });

  describe("GET /modalities", () => {
    it("should return all modalities with teachers", async () => {
      const mockModalities = [
        {
          id: 1,
          name: "Test Modality",
          days_of_week: "seg,qua",
          class_locations: "Quadra A",
          teachers: [],
        },
      ];

      modalityRepositoryMock.find.mockResolvedValue(mockModalities);

      const response = await request(app).get("/modalities").expect(200);

      expect(response.body).toEqual([
        {
          ...mockModalities[0],
          days_of_week: ["seg", "qua"],
          class_locations: ["Quadra A"],
        },
      ]);
    });
  });
});
