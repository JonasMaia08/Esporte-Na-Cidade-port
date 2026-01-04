import React, { useEffect, useRef, useState } from "react";
import { Manager } from "@/types/Manager";
import ManagersCadastrados from "../components/ManagersCadastrados";
import FormularioManagers from "../components/FormularioManagers";
import HeaderBasic from "../components/navigation/HeaderBasic";
import FooterMobile from "../components/navigation/FooterMobile";
import { getManagers, saveManager, deleteManager } from "../services/managerService";

import { useAuth } from "../contexts/AuthContext";
import { ConfirmModal } from "../components/ComfirmModal";

const GestaoDeManagers: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { fetchUser, user } = useAuth();
  const [modalAberto, setModalAberto] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  
  const handleDeleteClick = (id: number) => {
    setIdParaExcluir(id);
    setModalAberto(true);
  };



  const fetchManagers = async () => {
    try {
      const data = await getManagers();
      setManagers(data);
    } catch (error) {
      console.error("Erro ao buscar gerentes:", error);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleAddOrEdit = async (manager: Manager) => {
    try {
      await saveManager(manager);
      await fetchManagers();
      // Se o manager editado é o usuário logado, atualize o contexto global
      if (user && user.id === manager.id) {
        await fetchUser();
      }
      setSelectedManager(null);
    } catch (error) {
      console.error("Erro ao salvar gerente:", error);
    }
  };


  const handleEditClick = (manager: Manager) => {
    setSelectedManager(manager);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async () => {
    if (!idParaExcluir) return;
    try {
      await deleteManager(idParaExcluir);
      setManagers(prev => prev.filter(m => Number(m.id) !== Number(idParaExcluir)));
    } catch (error) {
      console.error('Erro ao deletar gerente:', error);
    } finally {
      setModalAberto(false);
      setIdParaExcluir(null);
    }

  };

  return (
    <section className="bg-[#F4F6FF] pb-20">
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
          <ConfirmModal
            isOpen={modalAberto}
            onClose={() => {setModalAberto(false);}}
            onConfirm={handleDelete}
            message="Tem certeza que deseja excluir este Gestor? Confirme com sua senha para continuar."
          />


          <section>
            <ManagersCadastrados
              managers={managers}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              managerEdicao={selectedManager}
            />
          </section>

          <section>
            <FormularioManagers
              ref={formRef}
              managerEdicao={selectedManager}
              onSubmit={handleAddOrEdit}
              onCancelEdit={() => setSelectedManager(null)}
            />
          </section>
        </main>
      </div>
    </section>
  );
};

export default GestaoDeManagers;
