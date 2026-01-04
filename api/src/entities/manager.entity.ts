import { Entity } from "typeorm";
import { UserBase } from "./user-base.entity";

@Entity('manager')
export class Manager extends UserBase{ }