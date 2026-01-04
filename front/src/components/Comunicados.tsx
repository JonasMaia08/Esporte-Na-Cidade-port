import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom";
import { CalendarDays } from 'lucide-react';
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, } from 'lucide-react'
import { Calendar } from 'lucide-react';
//import {Example} from '../components/PopCalendar'
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { comunicadosSchema } from "../lib/schemaComunicados";
import { Loader } from "lucide-react";
import { useHookFormMask } from "use-mask-input";

//separado em duas partes uma para criar um comunicado e outra para exibir

interface Comunicados {
  titulo?: string;
  conteudo: string;
  horario: string
}

interface EditProps {
  type: "EnableEdit" | "DisableEdit";
}

const comunicados = [
  { titulo: "", horario: "", conteudo: "Sem compromissos" },

]

//paginação
export const CalendarioCompromissos: React.FC<EditProps> = ({ type }) => {


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(comunicadosSchema),
  });

  const registerWithMask = useHookFormMask(register);

  async function onSubmit(data: FieldValues) {
    console.log("Formulário enviado:", data);

    const { horario, titulo, conteudo } = data;


  }


  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const PagedComunicados = useMemo(() => {
    return comunicados.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [currentPage, comunicados]);

  const totalPages = Math.ceil(comunicados.length / itemsPerPage);


  //retorna a tabela com os comunicados
  const navigate = useNavigate();
  const GoTo = (path: string) => navigate(path);
  return (
    <>
      {/* para visualizar apenas */}
      {type === "DisableEdit" && (
        <div className="mr-6 bg-[#d9d9d9] border rounded-md border-black p-4 lg:min-h-[720px]">
          <div className="flex flex-col h-[600px] mx-auto">
            <h2 className="text-lg font-semibold mb-1">Calendário de compromissos</h2>
            <div className=" sm:w-[400px] md:w-[400px] h-full bg-[#d9d9d9] p-4 ">
              <div>
                {PagedComunicados.map((comunicado, index) => (
                  <p key={index} className="flex flex-row space-x-1 mb-2 text-gray-700">
                    <p className=""><CalendarDays /></p>
                    <p> {comunicado.horario && `${comunicado.horario} - `}</p>
                    <p className="font-bold">{comunicado.titulo}: </p>
                    <p className="">{comunicado.conteudo}</p>
                  </p>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-[#d9d9d9] hover:bg-orange-500"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-[#d9d9d9] hover:bg-orange-500"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima página</span>
              </Button>
            </div>
          </div >
        </div>
      )}
      {/* para Criar um novo comunicado */}
      {type === "EnableEdit" && (
        <>
          <div className="mr-6">
            <div className="flex  flex-col h-[700px] mx-auto">
              <h2 className="text-lg ml-1  font-semibold mb-5">Criar um novo comunicado</h2>
              <div className="border rounded-md border-black w-[500px] md:w-[650px] bg-gray-100 lg:w-[900px] h-full  p-4 shadow-md">
                <form
                  className="flex flex-col h-full"
                  onSubmit={handleSubmit(onSubmit)}
                >

                  <div className="flex items-center mb-4">
                    <div className="w-full">
                      <label
                        htmlFor="horario"
                        className="block text-md font-medium mb-1"
                      >
                        Data e Hora
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          id="horario"
                          className="bg-[#d9d9d9] flex-1 w-full h-12 px-4  border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-orange-600 focus:ring-opacity-40"
                          {...registerWithMask("horario", "99/99/9999 99:99")}
                        />
                       
                      </div>
                      {/* Espaço reservado para o erro */}
                      <p className="text-xs text-red-400 mt-1 min-h-[20px]">
                        {errors.horario?.message as string || ""}
                      </p>
                    </div>

                  </div>

                  <div className="mb-6">
                    <div className="w-full">
                      <label htmlFor="titulo" className="block text-md font-medium  mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        id="titulo"
                        placeholder="Título do comunicado"
                        className="bg-[#d9d9d9] w-full h-12 px-4  border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-orange-600 focus:ring-opacity-40"
                        {...register("titulo")}
                      />
                    </div>
                  </div>


                  <label
                    htmlFor="titulo"
                    className="block text-md font-medium mb-1"
                  >
                    Descrição
                  </label>
                  <div className="flex-1 relative">
                    <textarea
                      id="conteudo"
                      placeholder="Digite o conteúdo do comunicado"
                      className="bg-[#d9d9d9] w-full h-full px-4 py-2  border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-orange-600 focus:ring-opacity-40 resize-none"
                      {...register("conteudo")}
                    />
                    <p className="text-xs text-red-400 mt-1 absolute -bottom-5 left-0">
                      {errors.conteudo?.message as string}
                    </p>
                  </div>



                  <div className="py-4 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => GoTo("/")}
                      className="h-12 px-6 font-bold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-300"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-6 font-bold text-white bg-orange-600 rounded-md hover:bg-orange-700 transition duration-300"
                    >
                      {isSubmitting ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Confirmar"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

    </>
  );
};
