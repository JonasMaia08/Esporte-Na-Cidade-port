import "reflect-metadata";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { UserBase } from "./user-base.entity";
import { Modality } from "./modality.entity";
import { Token } from "./token.entity";

@Entity("teacher")
export class Teacher extends UserBase {
    @Column("text")
    about: string;
    
    @ManyToOne(() => Modality, (modality) => modality.teachers, { onDelete: "SET NULL" })
    modality: Modality;

    @OneToMany(() => Token, (t) => t.teacher)
    tokens: Token[];
}
