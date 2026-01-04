import { describe, it, beforeEach } from "node:test";
import app from "../app";
import request from "supertest";

beforeEach(() => { })

describe.skip("Testing the Material router", () => {
    describe("GET request", () => {
        it("should throw an error when requesting an invalid ID", () => {
            request(app)
            .get("/api/material/-1")
            .expect("Content-Type", /json/)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
            });
        });
    })
    describe("POST request", () => {
        it("should create a new material with correct data", () => {
        });
    })
});
