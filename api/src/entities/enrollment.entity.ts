import "reflect-metadata";
import { Column, CreateDateColumn, UpdateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Athlete } from "./athlete.entity";
import { Modality } from "./modality.entity";

@Entity("enrollment")
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @Column({ type: "boolean", default: false })
  aproved: boolean;

  @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @Column({ type: "int" })
  athleteId: number;

  @Column({ type: "int" })
  modalityId: number;

  @ManyToOne(() => Athlete, a => a.enrollments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "athleteId" })
  athlete: Athlete;

  @ManyToOne(() => Modality, m => m.enrollments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "modalityId" })
  modality: Modality;
}
