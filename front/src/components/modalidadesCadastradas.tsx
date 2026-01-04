import React, { useEffect, useState } from "react";
import { Modality } from "../types/Modality";
import { Professor } from "../types/Professor";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ModalidadesCadastradasProps {
    modalidades: Modality[];
    onEdit: (modalidade: Modality) => void;
    onDelete: (id: number) => void;
    modalidadeEdicao: Modality | null;
    setModalidades: React.Dispatch<React.SetStateAction<Modality[]>>;
    onAssignTeacher: (modalidade: Modality) => void;
    onCreateClick: () => void; // <-- nova prop
}

export const ModalidadesCadastradas: React.FC<ModalidadesCadastradasProps> = ({
    modalidades,
    onEdit,
    onDelete,
    modalidadeEdicao,
    onAssignTeacher,
    setModalidades,
    onCreateClick
}) => {

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(6);
    const PER_PAGE_OPTIONS = [3, 6, 9, 12];

    const totalPages = Math.ceil(modalidades.length / perPage) || 1;

    const paginatedModalidades = modalidades.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [modalidades, perPage]);

    return (
        <div>
            
            <div className="rounded-lg border border-black p-4 bg-[#d9d9d9]">
                {/* Dropdown de quantidade de cards por página */}
                <select
                    className="transition-all  rounded-lg  mb-6 border border-black flex h-7 justify-between items-center font-normal"
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                >
                    {PER_PAGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                            Modalidades por página: {opt}
                        </option>
                    ))}
                </select>
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {paginatedModalidades.map((modalidade) => (
                        <div
                            key={modalidade.id}
                            className="bg-white border border-black rounded-lg p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col relative"
                        >
                            <h3 className="font-bold text-lg mb-2">{modalidade.name}</h3>
                            <p className="text-sm text-gray-700 mb-1">
                                <span className="font-semibold">Descrição:</span>{" "}
                                {modalidade.description || "-"}
                            </p>
                            <p className="text-sm text-gray-700 mb-1">
                                <span className="font-semibold">Local:</span>{" "}
                                {modalidade.class_locations || "-"}
                            </p>
                            <p className="text-sm text-gray-700 mb-1">
                                <span className="font-semibold">Dias:</span>{" "}
                                {modalidade.days_of_week || "-"}
                            </p>
                            <p className="text-sm text-gray-700 mb-2">
                                <span className="font-semibold">Professores:</span>{" "}
                                {Array.isArray(modalidade.teachers) && modalidade.teachers.length > 0
                                    ? (modalidade.teachers as Professor[]).map((t) => t.name).join(", ")
                                    : "-"}
                            </p>

                            <div className="flex gap-3 mt-auto">
                                <button
                                    onClick={() => onAssignTeacher(modalidade)}
                                    className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform"
                                    title="Atribuir professor"
                                >
                                    <img src="/icon/teacher.png" alt="Atribuir professor" className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onEdit(modalidade)}
                                    className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform"
                                    title="Editar"
                                >
                                    <img src="/icon/pencil.svg" alt="Editar" className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onDelete(modalidade.id)}
                                    className={`w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform ${modalidadeEdicao?.id === modalidade.id ? "opacity-35" : ""
                                        }`}
                                    disabled={modalidadeEdicao?.id === modalidade.id}
                                    title="Excluir"
                                >
                                    <img src="/icon/trash.svg" alt="Deletar" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="justify-between gap-2 me-10 mt-10 flex flex-row">
                    <button
                        className="mt- self-start md:w-fit font-bold font-inter bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                        onClick={onCreateClick}
                    >
                        Cadastrar Nova Modalidade
                    </button>

                    {/* Mensagem de vazio */}
                    {modalidades.length === 0 && (
                        <div className="text-center text-gray-600 mt-6">
                            Nenhuma modalidade cadastrada.
                        </div>
                    )}

                    {/* Paginação */}
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
        </div >
    );
};
