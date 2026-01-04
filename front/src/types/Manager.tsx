export interface Manager {
  id?: number;
  name: string;
  password?: string;
  cpf: string;
  rg?: string;
  birthday: string;
  phone: string;
  photo_url?: string;
  email: string;
  address?: any; // Ajuste para Address se necessário
  role?: number;
}
