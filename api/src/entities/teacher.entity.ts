import { Column, Entity, ManyToOne } from "typeorm";
import { UserBase } from "./user-base.entity";
import { Modality } from "./modality.entity";

@Entity("teacher")
export class Teacher extends UserBase {
    @Column("text")
    about: string;

    @ManyToOne(() => Modality, (modality) => modality.teachers, { onDelete: "SET NULL" })
    modality: Modality;
}
