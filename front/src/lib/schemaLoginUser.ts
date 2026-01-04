import {z} from 'zod';
// Atleta schema
const atletaSchema = z.object({
  cpf: z
  .string()
  .min(1, { message: "O campo CPF  precisa ser preenchido" })
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "CPF Inválido" }),
  password: z.string().min(1,{message: "Insira a senha"})
});

// Professor and Gestor schema
const professorGestorSchema = z.object({
  email: z.string().email({ message: 'Email Inválido' }),
  password: z.string().min(1, {message: "Insira a Senha"})
});

export const userSchema = z.union([atletaSchema, professorGestorSchema]);