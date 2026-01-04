import "reflect-metadata";
import { Priority } from "../enums/priority.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('release')
export class Release {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    title: string;

    @Column("text")
    content: string;

    // Trocar para enum quando subir para produção
    @Column({ type: "text", enum: Priority, default: Priority.LOW })
    priority: Priority;

    // Trocar o type para timestamp quando subir para produção
    @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;
}
