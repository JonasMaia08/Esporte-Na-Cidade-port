import { Column, Entity, ManyToMany, OneToMany } from "typeorm";
import { UserBase } from "./user-base.entity";
import { Atendiment } from "./atendiment.entity";
import { Modality } from "./modality.entity";
<<<<<<< HEAD
import { AthleteToModality } from "./athleteToModality.entity";
=======
import { ManyToOne } from "typeorm";
import { Enrollment } from "./enrollment.entity";
import { OneToMany } from "typeorm";
>>>>>>> af7abc0 (feat: envio e recebimento da lista de chamadas)

@Entity("athlete")
export class Athlete extends UserBase {
  @Column("text", { nullable: true, default: "Nenhum nome informado" })
  father_name: string;

  @Column("text", { nullable: true })
  father_phone: string;

  @Column("text", { nullable: true })
  father_cpf: string;

  @Column("text", { nullable: true })
  father_email: string;

  @Column("text", { nullable: true, default: "Nenhum nome informado" })
  mother_name: string;

  @Column("text", { nullable: true })
  mother_phone: string;

  @Column("text", { nullable: true })
  mother_cpf: string;

  @Column("text", { nullable: true })
  mother_email: string;

  @Column("text", { nullable: true, default: "Nenhum responsável informado" })
  responsible_person_name: string;

  @Column("text", { nullable: true })
  responsible_person_email: string;

  @Column("text", { nullable: true })
  responsible_person_cpf: string;

  @Column("text", {
    nullable: true,
    default: "Nenhum tipo sanguíneo informado",
  })
  blood_type: string;

  @Column("text", { nullable: true })
  photo_url_cpf_front: string;

  @Column("text", { nullable: true })
  photo_url_cpf_back: string;

  @Column("text", { nullable: true, default: "Nenhuma alergia informada" })
  allergy: string;

  @ManyToMany(() => Atendiment, (atendiment) => atendiment.athletes, {})
  atendiments: Atendiment[];

<<<<<<< HEAD
    @ManyToMany(() => Modality, (modality) => modality.registred_athletes)
    modalities: Modality[];

    @OneToMany(() => AthleteToModality, (athleteToModality) => athleteToModality.athlete)
    athleteToModality: AthleteToModality[];
=======
  @ManyToMany(() => Modality, (modality) => modality.registred_athletes)
  modalities: Modality[];

  @OneToMany(() => Enrollment)
  enrollments: Enrollment[];
>>>>>>> af7abc0 (feat: envio e recebimento da lista de chamadas)
}
