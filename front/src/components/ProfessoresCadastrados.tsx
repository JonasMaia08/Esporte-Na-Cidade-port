import React from "react";
import { Professor } from "../types/Professor";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  professores: Professor[];
  professorEdicao: Professor | null;
  onEdit: (professor: Professor) => void;
  onDelete: (id: number) => void;
}

const ProfessoresCadastrados: React.FC<Props> = ({
  professores,
  professorEdicao,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(6);
  const PER_PAGE_OPTIONS = [3, 6, 9, 12];
  const totalPages = Math.ceil(professores.length / perPage) || 1;
  const paginatedProfessores = professores.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  React.useEffect(() => {
    setCurrentPage(1); // volta para página 1 ao atualizar lista
  }, [professores, perPage]);

  return (
    <div>
      <h2 className="font-bold text-3xl mb-10">Professores Cadastrados</h2>
      <div className="bg-[#D9D9D9] border border-black p-4 rounded-lg">
        {/* Dropdown de quantidade de cards por página */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="bg-white border border-black p-1 rounded-lg">
            <label className="font-medium text-sm">Professores por página:</label>
            <select
              className="cursor-pointer px-2 py-1 text-sm"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              {PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paginatedProfessores.map((professor) => (
            <div
              key={professor.id}
              className={`bg-white border border-black rounded-lg p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center relative`}
            >
              <div className="text-center w-full">
                <h3 className="font-bold text-lg mb-1">{professor.name}</h3>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Modalidade:</span>{" "}
                  {professor.modality?.name || "-"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Email:</span>{" "}
                  {professor.email}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Telefone:</span>{" "}
                  {professor.phone}
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onEdit(professor)}
                  className="w-8 h-8 flex items-center justify-center hover:scale-150 transition-transform"
                  title="Editar"
                >
                  <img
                    src="/icon/pencil.svg"
                    alt="Editar"
                    className="w-5 h-5"
                  />
                </button>
                <button
                  onClick={() => onDelete(professor.id)}
                  className={`w-8 h-8 flex items-center justify-center hover:scale-150 transition-transform ${professorEdicao?.id === professor.id ? "opacity-35" : ""
                    }`}
                  disabled={professorEdicao?.id === professor.id}
                  title="Excluir"
                >
                  <img
                    src="/icon/trash.svg"
                    alt="Deletar"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Paginação */}
        <div className='justify-end items-end mt-10 mr-10 flex flex-row'>
          {totalPages > 1 && (
            <div className="flex items-center ">



              <div>
                <span className="mx-2 text-sm font-semibold">
                  Página {currentPage} de {totalPages}
                </span>




                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`px-4 py-2 rounded-l-md border border-black ${currentPage === 1
                    ? "bg-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-not-allowed"
                    : "bg-[#EB8317] text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-transform hover:-translate-x-1 hover:translate-y-1 hover:shadow-none"
                    }`}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-6 w-4" />
                </button>



                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-r-md border border-black ${currentPage === totalPages
                    ? "bg-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-not-allowed"
                    : "bg-[#EB8317] text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-transform hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    }`}
                >
                  <ChevronRight className="h-6 w-4" /> {/*&gt; */}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessoresCadastrados;
