import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Modality } from "./modality.entity";
import { Athlete } from "./athlete.entity";
import { Column } from "typeorm";

@Entity("atendiment")
export class Atendiment {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @ManyToOne(() => Modality, { onDelete: "SET NULL" })
  modality: Modality;

  @ManyToOne(() => Athlete)
  athlete: Athlete;

  @Column("boolean")
  present: boolean;

  @Column("text", { nullable: true })
  description?: string;
}