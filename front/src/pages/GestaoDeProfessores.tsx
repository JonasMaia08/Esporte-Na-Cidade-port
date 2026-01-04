import React, { useEffect, useRef, useState } from "react";
import { Professor } from "@/types/Professor";
import ProfessoresCadastrados from "../components/ProfessoresCadastrados";
import FormularioProfessores from "../components/FormularioProfessores";
import { getProfessores, saveProfessor, deleteProfessor } from "../services/professorService";
import HeaderBasic from "../components/navigation/HeaderBasic";
import FooterMobile from "../components/navigation/FooterMobile";
import { ConfirmModal } from "../components/ComfirmModal";

const GestaoDeProfessor: React.FC = () => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);


  const handleDeleteClick = (id: number) => {
    setIdParaExcluir(id);
    setModalAberto(true);
  };


  const formularioRef = useRef<HTMLFormElement>(null);

  const fetchProfessores = async () => {
    try {
      const data = await getProfessores();
      setProfessores(data);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  const handleAddOrEdit = async (professor: Professor) => {
    try {
      await saveProfessor(professor);
      await fetchProfessores();
      setSelectedProfessor(null);
    } catch (error) {
      console.error("Erro ao salvar professor:", error);
    }
  };

  const handleEditClick = (professor: Professor) => {
    professor.password = "";
    setSelectedProfessor(professor);
    formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async () => {
    if (!idParaExcluir) return;
    try {
      await deleteProfessor((idParaExcluir));
      setProfessores(prev => prev.filter(prof => Number(prof.id) !== idParaExcluir));
    } catch (error) {
      console.error('Erro ao deletar professor:', error);
    } finally{
      setModalAberto(false);
          setIdParaExcluir(null);
    }
  };

  return (
    <section className="bg-[#F4F6FF] pb-20">
      <ConfirmModal
        isOpen={modalAberto}
        onClose={() => { setModalAberto(false); }}
        onConfirm={handleDelete}
        message="Tem certeza que deseja excluir este Professor? Confirme com sua senha para continuar."
      />


      <HeaderBasic
        type="visitante"
        links={[
          { label: "Home", path: "/home-gestor" },
          { label: "Relatório Geral", path: "/home-gestor/relatorio-geral" },
        ]}
      />

      <FooterMobile />

      <div className="min-h-screen xl:px-36 md:px-11 px-5 py-6">
        <main className="space-y-8 mt-6">
          <section>
            <ProfessoresCadastrados
              professores={professores}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              professorEdicao={selectedProfessor}
            />
          </section>

          <section>
            <FormularioProfessores
              ref={formularioRef}
              professorEdicao={selectedProfessor}
              onSubmit={handleAddOrEdit}
              onCancelEdit={() => setSelectedProfessor(null)}
            />
          </section>
        </main>
      </div>
    </section>
  );
};

export default GestaoDeProfessor;
