import {
  AthleteAvailableResponseSchema,
  AtendimentSchema,
  CreateAtendimentsSchema,
} from "../routes/modality";
import { z } from "zod";

describe("Modality Schemas", () => {
  describe("AthleteAvailableResponseSchema", () => {
    it("should validate correct response", () => {
      const validData = {
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

      expect(() =>
        AthleteAvailableResponseSchema.parse(validData)
      ).not.toThrow();
    });
  });

  describe("AtendimentSchema", () => {
    it("should validate correct atendiment", () => {
      const validAtendiment = {
        modalityId: 1,
        athleteId: 1,
        present: true,
      };

      expect(() => AtendimentSchema.parse(validAtendiment)).not.toThrow();
    });

    it("should reject invalid atendiment", () => {
      const invalidAtendiment = {
        modalityId: 0, // Deve ser positivo
        athleteId: "1", // Deve ser número
        present: "yes", // Deve ser booleano
      };

      expect(() => AtendimentSchema.parse(invalidAtendiment)).toThrow();
    });
  });

  describe("CreateAtendimentsSchema", () => {
    it("should reject empty array", () => {
      expect(() => CreateAtendimentsSchema.parse([])).toThrow();
    });
  });
});
