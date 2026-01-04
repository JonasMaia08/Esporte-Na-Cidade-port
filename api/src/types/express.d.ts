import { Request } from "express";
import { Teacher } from "../entities/teacher.entity";
import { Athlete } from "../entities/athlete.entity";
import { Manager } from "../entities/manager.entity";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        type: "athlete" | "teacher" | "manager";
      };
      accessToken?: string;
      athlete?: Athlete;
      teacher?: Teacher;
      manager?: Manager;
    }
  }
}

export interface ExpressRequest extends Request {
  athlete?: Athlete;
  teacher?: Teacher;
  manager?: Manager;
  accessToken?: string;
}
