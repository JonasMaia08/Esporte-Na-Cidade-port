import "reflect-metadata";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('documentation')
export class Documentation {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    title: string;

    @Column("text")
    description: string;

    // Trocar para timestamp antes de subir para produção
    @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;
    
    @UpdateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP", onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
