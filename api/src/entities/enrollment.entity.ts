import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Athlete } from "./athlete.entity";
import { Modality } from "./modality.entity";

@Entity("enrollment")
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @Column({  type: "boolean", default: false })
  aproved: boolean;

  @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @PrimaryColumn()
  @ManyToOne(() => Athlete)
  athlete: Athlete;

  @PrimaryColumn()
  @ManyToOne(() => Modality)
  modality: Modality;
}
