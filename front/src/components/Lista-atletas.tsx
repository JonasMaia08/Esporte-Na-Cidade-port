import React, { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { PersonDetailsPopover } from "./ui/person-details-popover";

interface Atleta {
  nome: string;
  cpf: string;
  email: string;
  modalidade: string;
  endereco: string;
  telefone: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  horario: string;
}

interface PaginatedListProps {
  items: Atleta[];
  itemsPerPage: number;
}
interface Lista {
  atleta: Atleta;
}

function maskCpf(cpf: string): string {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export const Lista: React.FC<PaginatedListProps> = ({
  items,
  itemsPerPage,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <>
    <div className="rounded-lg border border-black p-4 bg-[#d9d9d9] max-w-7xl mx-10 sm:mx-10 md:mx-auto">
      <Contador total={items.length} />
      <div className=" max-w-7xl">
        <div className="bg-white opacity-100 p-4  rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black">
          <div className="grid grid-cols-3 gap-2 lg:gap-10 font-semibold text-gray-700 mb-2">
            <p className="border-b-2 border-black pb-2">Nome</p>
            <p className="border-b-2 border-black pb-2">CPF</p>
            <p className="border-b-2 border-black pb-2">E-mail</p>
          </div>
          {currentItems.map((item, index) => (
            <Popover key={index}>
              <PopoverTrigger asChild>
                <div className="grid grid-cols-3 gap-2 lg:gap-10 py-2 border-t  border-gray-200 cursor-pointer hover:bg-gray-100">
                  <p className="break-words">{item.nome}</p>
                  <p className="break-words">{maskCpf(item.cpf)}</p>
                  <p className="break-words">{item.email}</p>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <PersonDetailsPopover atleta={item} />
              </PopoverContent>
            </Popover>
          ))}
          <div className="flex justify-evenly items-center mt-4">
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <div className=" space-x-0.5">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border border-black text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
                                          ${
                                            currentPage === 1
                                              ? "bg-white cursor-not-allowed text-gray-500"
                                              : "bg-[#EB8317] hover:bg-orange-600 transition-transform hover:shadow-none hover:-translate-x-1 hover:translate-y-1"
                                          }`}
                variant="default"
                size="default"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border border-black text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
                                          ${
                                            currentPage === totalPages
                                              ? "bg-white cursor-not-allowed text-gray-500"
                                              : "bg-[#EB8317] hover:bg-orange-600 transition-transform hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                                          }`}
                variant="default"
                size="default"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima página</span>
              </Button>
            </div>
          </div>
        </div>
    </div>
    </div>
    </>
  );
};

export const Contador: React.FC<{ total: number }> = ({ total }) => {
  return (
    <div className="bg-white opacity-100 p-2 mb-6 rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border flex flex-col border-black">
      <div className="flex flex-col justify-center">
        <p className="font-inter mt-4 mx-6 font-semibold mb-1">
          Quantidade de Atletas Inscritos
        </p>
        <p className="text-5xl mb-2 mx-6 font-bold text-orange-500">{total}</p>
      </div>
      {/* <button
                className="bg-[#EB8317] text-black py-1 px-4 rounded border border-black absolute bottom-3 right-4"
            >
                Gerar Lista
            </button> */}
    </div>
  );
};
