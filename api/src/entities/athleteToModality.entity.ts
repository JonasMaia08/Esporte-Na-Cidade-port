import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Athlete } from "./athlete.entity";
import { Modality } from "./modality.entity";

@Entity()
export class AthleteToModality {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "boolean", default: false})
    approved: boolean;

    @Column({type: "boolean", default: false})
    active: boolean;

    @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP", onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @ManyToOne(() => Athlete, (athlete) => athlete.athleteToModality)
    athlete: Athlete;

    @ManyToOne(() => Modality, (modality) => modality.athleteToModality)
    modality: Modality;
}
