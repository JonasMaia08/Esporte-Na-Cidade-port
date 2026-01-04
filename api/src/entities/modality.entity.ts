import { DaysOfWeek } from "../enums/daysOfWeek.enum";
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Teacher } from "./teacher.entity";
import { Athlete } from "./athlete.entity";
<<<<<<< HEAD
import { AthleteToModality } from "./athleteToModality.entity";
=======
import { ManyToOne } from "typeorm";
import { Enrollment } from "./enrollment.entity";
>>>>>>> af7abc0 (feat: envio e recebimento da lista de chamadas)

@Entity("modality")
export class Modality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  name: string;

  @Column("text")
  description: string;

  @Column({ type: "text", array: true })
  days_of_week: string[];

  @Column({ type: "time" })
  start_time: string;

  @Column({ type: "time" })
  end_time: string;

  @Column({ type: "text", array: true })
  class_locations: string[];

  @OneToMany(() => Teacher, (teacher) => teacher.modality, {
    onDelete: "SET NULL",
  })
  teachers: Teacher[];

<<<<<<< HEAD
    @ManyToMany(() => Athlete, (athlete) => athlete.modalities)
    registred_athletes: Athlete[];

    @OneToMany(() => AthleteToModality, (athleteToModality) => athleteToModality.modality)
    athleteToModality: AthleteToModality[];
=======
  @ManyToMany(() => Athlete, (athlete) => athlete.modalities)
  registred_athletes: Athlete[];

  @OneToMany(() => Enrollment)
  enrollments: Enrollment[];
>>>>>>> af7abc0 (feat: envio e recebimento da lista de chamadas)
}
