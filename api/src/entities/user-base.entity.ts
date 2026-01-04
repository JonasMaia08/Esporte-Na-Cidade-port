import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";
import { Roles } from "../enums/roles.enum";

@Entity('user-base')
export abstract class UserBase {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    name: string;

    @Column("text")
    password: string;

    @Column({ type: "text", length: 11, unique: false }) // CPF deve ser guardado sem formatação
    cpf: string;

    @Column("text", { nullable: true })
    rg: string;

    @Column("text")
    birthday: string;

    @Column("text")
    phone: string;

    @Column("text", { nullable: true })
    photo_url: string;

    @Column("text", { unique: true, nullable: true })
    email: string;

    @OneToMany(() => Address, (address) => address.user, {
        eager: true,
    })
    addresses: Address[];

    // Trocar para enum antes de subir para produção
    @Column({ type: "int", enum: Roles })
    role: Roles;
}
