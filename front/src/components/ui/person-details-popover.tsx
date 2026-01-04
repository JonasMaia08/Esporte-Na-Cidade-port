import React from 'react'

interface Atleta {
    nome: string
    modalidade: string
    endereco: string
    telefone: string
    nomeResponsavel: string
    telefoneResponsavel: string
    horario: string
}

interface PersonDetailsProps {
    atleta: Atleta
}

function maskPhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
        // Celular: (99) 99999-9999
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (digits.length === 10) {
        // Fixo: (99) 9999-9999
        return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
}

export function PersonDetailsPopover({ atleta }: PersonDetailsProps) {
    return (
        <div className="flex bg-[#d9d9d9] w-96 border-black border relative p-4 rounded-md">
            <div className="flex flex-col justify-center w-full">
                <p className="font-inter mt-2 mb-1">
                    <span className="font-semibold">Nome:</span> {atleta.nome}
                </p>
                <p className="font-inter mt-2 mb-1">
                    <span className="font-semibold">Modalidade:</span> {atleta.modalidade}
                </p>
                <p className="font-inter mt-2 mb-1">
                    <span className="font-semibold">Endereço:</span> {atleta.endereco}
                </p>
                <p className="font-inter mt-2 mb-1">
                    <span className="font-semibold">Telefone:</span> {maskPhone(atleta.telefone)}
                </p>
                <p className="font-inter mt-2 mb-1">
                    <span className="font-semibold">Nome do Responsável:</span> {atleta.nomeResponsavel}
                </p>
                <p className="font-inter mt-2 mb-1">
                    <span className="font-semibold">Telefone do Responsável:</span> {maskPhone(atleta.telefoneResponsavel)}
                </p>
                <p className="font-inter mt-2 mb-1">
                    <span className="font-semibold">Horário:</span> {atleta.horario}
                </p>
            </div>
        </div>
    )
}
