import React, { useEffect, useRef, useState } from "react";
import { Modality } from "@/types/Modality";
import { ModalidadesCadastradas } from "../components/modalidadesCadastradas";
import FormularioModalidades from "../components/FormularioModalidades";
import {
    getAllModalities,
    createModality,
    deleteModality,
    updateModality,
    getModalityById
} from "../services/modalityService";
import HeaderBasic from "../components/navigation/HeaderBasic";
import FooterMobile from "../components/navigation/FooterMobile";
import { ConfirmModal } from "../components/ComfirmModal";
import AssignTeacherForm from "../components/AssignTeacherModal";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/navigation/AppSidebar-prof";

export const CadastroModalidades: React.FC = () => {
    const [modalidades, setModalidades] = useState<Modality[]>([]);
    const [modalidadeSelecionada, setModalidadeSelecionada] = useState<Modality | null>(null);
    const formularioRef = useRef<HTMLFormElement>(null);
    const [modalAssignTeacherOpen, setModalAssignTeacherOpen] = useState(false);
    const [modalidadeParaAssign, setModalidadeParaAssign] = useState<Modality | null>(null);

    //modal form
    const [showModal, setShowModal] = useState(false);

    //modal confirmar delete
    const [modalAberto, setModalAberto] = useState(false);
    const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
    const handleDeleteClick = (id: number) => {
        setIdParaExcluir(id);
        setModalAberto(true);
    };

    useEffect(() => {
        fetchModalidades();
    }, []);

    const fetchModalidades = async () => {
        try {
            const data = await getAllModalities();
            setModalidades(data);
        } catch (error) {
            console.error("Erro ao carregar modalidades:", error);
        }
    };

    const handleCreate = async (data: Omit<Modality, "id" | "teachers" | "registred_athletes">) => {
        try {
            await createModality(data);
            await fetchModalidades()
        } catch (error) {
            console.error("Erro ao salvar modalidade:", error);
            throw error;
        }
    };
    const handleAssignTeacherClick = (modality: Modality) => {
        setModalidadeParaAssign(modality);
        setModalAssignTeacherOpen(true);
    };

    const handleUpdate = async (
        id: number,
        data: Omit<Modality, "id" | "teachers" | "registred_athletes">
    ) => {
        try {
            await updateModality(id, data);
            await fetchModalidades();
        } catch (error) {
            console.error("Erro ao atualizar modalidade:", error);
            throw error;
        }
    };

    const handleEditClick = (modality: Modality) => {
        setModalidadeSelecionada(modality);
        setShowModal(true);
        console.log("clicou")
    };

    const confirmarExclusao = async () => {
        if (idParaExcluir === null) return;

        try {
            await deleteModality(idParaExcluir);
            setModalidades((prev) => prev.filter((mod) => mod.id !== idParaExcluir));
            if (modalidadeSelecionada?.id === idParaExcluir) {
                setModalidadeSelecionada(null);
            }
        } catch (error) {
            console.error("Erro ao deletar modalidade:", error);
        } finally {
            setModalAberto(false);
            setIdParaExcluir(null);
        }
    };

    return (
        <SidebarProvider>

            <AppSidebar type="atleta" />
            <SidebarInset>

                <section className="bg-[#F4F6FF] pb-20">
                    <HeaderBasic
                        type="visitante"
                        links={[
                            { label: "Home", path: "/home-gestor" },
                            {
                                label: "Relatório Geral",
                                path: "/home-gestor/relatorio-geral",
                            },
                        ]}
                    />
                    <FooterMobile />

                    <div className="min-h-screen xl:px-36 md:px-11 px-5 py-6">
                        <main className="space-y-8 mt-6">
                            <section>
                                <div className="flex ">
                                    <h2 className="font-bold text-3xl mb-10">Modalidades Cadastradas</h2>
                                </div>

                                
                                    <ModalidadesCadastradas
                                        modalidades={modalidades}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                        modalidadeEdicao={modalidadeSelecionada}
                                        setModalidades={setModalidades}
                                        onAssignTeacher={handleAssignTeacherClick}
                                        onCreateClick={() => {
                                            setModalidadeSelecionada(null);
                                            setShowModal(true);
                                        }}
                                    />



                                
                            </section>

                            <div className="flex justify-end">
                                <ConfirmModal
                                    isOpen={modalAberto}
                                    onClose={() => setModalAberto(false)}
                                    onConfirm={confirmarExclusao}
                                    message="Tem certeza que deseja excluir esta modalidade?"
                                />
                            </div>

                            <section className="flex justify-end">

                                {/* modal cadastro */}

                                {showModal && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative">

                                            <FormularioModalidades
                                                ref={formularioRef}
                                                modalityEdicao={modalidadeSelecionada}
                                                onSubmit={async (data) => {
                                                    if (modalidadeSelecionada) {
                                                        await handleUpdate(modalidadeSelecionada.id, data);
                                                    } else {
                                                        await handleCreate(data);
                                                    }
                                                    setShowModal(false);
                                                    setModalidadeSelecionada(null);
                                                    await fetchModalidades();
                                                }}
                                                onCancelEdit={() => {
                                                    setModalidadeSelecionada(null);
                                                    setShowModal(false);
                                                    fetchModalidades();
                                                }}
                                            />

                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="flex justify-end">

                                {/* modal atribuição */}
                                {modalAssignTeacherOpen && modalidadeParaAssign && (
                                    <div className="fixed top-0 left-0 right-0 bottom-0 min-h-screen z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative">
                                            <AssignTeacherForm
                                                modality={modalidadeParaAssign}
                                                onCancel={() => {
                                                    setModalidadeParaAssign(null);
                                                    setModalAssignTeacherOpen(false);
                                                }}
                                                onSubmitSuccess={() => {
                                                    setModalidadeParaAssign(null);
                                                    setModalAssignTeacherOpen(false);
                                                    fetchModalidades();
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </section>
                        </main>
                    </div>
                </section>
            </SidebarInset>
        </SidebarProvider>
    );
};
