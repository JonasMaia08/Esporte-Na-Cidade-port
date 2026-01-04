import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Enrollment } from "./enrollment.entity";
import { Athlete } from "./athlete.entity";

@Entity("enrollment_logs")
export class EnrollmentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Enrollment, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "enrollment_id" })
  enrollment: Enrollment;

  @ManyToOne(() => Athlete, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "athlete_id" })
  athlete: Athlete;

  @Column({ type: "varchar", length: 50 })
  event_type: string;

  @Column({ type: "text", nullable: true })
  event_description: string | null;

  @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "int", nullable: true })
  changed_by: number | null;

  @Column({ type: "json", nullable: true })
  old_value: any;

  @Column({ type: "json", nullable: true })
  new_value: any;
}
