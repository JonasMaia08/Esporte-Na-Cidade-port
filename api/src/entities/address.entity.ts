import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserBase } from "./user-base.entity";

@Entity('address')
export class Address {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    state: string;

    @Column("text")
    city: string;

    @Column("text")
    neighborhood: string;

    @Column("text")
    street: string;

    @Column("int")
    number: number;

    @Column("text")
    complement: string;

    @Column("text")
    references: string;

    @ManyToOne(() => UserBase, { onDelete: "CASCADE" })
    user: UserBase;
}
