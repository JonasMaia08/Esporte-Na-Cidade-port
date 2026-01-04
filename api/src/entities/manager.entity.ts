import { Entity, OneToMany } from "typeorm";
import { UserBase } from "./user-base.entity";
import { Token } from "./token.entity";

@Entity('manager')
export class Manager extends UserBase 
{
    @OneToMany(() => Token, (t) => t.manager)
    tokens: Token[];
}