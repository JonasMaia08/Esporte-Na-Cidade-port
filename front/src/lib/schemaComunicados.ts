import {z} from 'zod';
const comunicadosSchema = z.object({
  titulo: z 
  .string()
  .optional(),

  conteudo: z 
  .string()
  .min(1, { message: "O texto é obrigatório" }),

  horario: z
  .string()
  .min(1, { message: "A data é obrigatória" })
  .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/([0-9]{4})\s([01][0-9]|2[0-3]):([0-5][0-9])$/, { message: "data inválida" }),

});



export { comunicadosSchema};