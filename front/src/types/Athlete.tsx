export interface Address {
    id?: number;
    state?: string;
    city?: string;
    neighborhood?: string;
    street?: string;
    number?: number;
    complement?: string;
    references?: string;
}

export interface Athlete {
    id?: number;
    name: string;
    cpf: string;
    rg: string;
    phone: string;
    address?: Address;

    fatherName: string;
    motherName: string;
    birthday: string;
    phoneNumber: string;
    password: string;
    email: string;
    responsibleName: string;
    responsibleEmail: string;
    motherPhoneNumber: string;
    fatherPhoneNumber: string;
    bloodType: string;
    frontIdPhotoUrl: string | null;
    backIdPhotoUrl: string | null;
    athletePhotoUrl: string | null;
    foodAllergies: string;
    estado: string,
    cidade: string,
    bairro: string,
    rua: string,
    numeroDaCasa: string,
    complemento: string,
    referencia: string,
}