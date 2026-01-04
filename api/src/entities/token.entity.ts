import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Teacher } from "./teacher.entity"
import { Manager } from "./manager.entity"

@Entity("token")
export class Token {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "text"})
    token: string
    
    @ManyToOne(() => Teacher, (teacher) => teacher.tokens)
    teacher: Teacher

    @ManyToOne(() => Manager, (manager) => manager.tokens)
    manager: Manager

    @Column({type: "datetime", default: () => "CURRENT_TIMESTAMP"})
    createdAt: string
}