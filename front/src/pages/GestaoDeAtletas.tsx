import React, { useEffect, useRef, useState } from "react";
import { Athlete } from "@/types/Athlete";
import { Modality } from "../types/Modality";
import AtletasCadastrados from "../components/AtletasCadastrados";
import FormularioAtletas from "../components/FormularioAtletas";
import HeaderBasic from "../components/navigation/HeaderBasic";
import FooterMobile from "../components/navigation/FooterMobile";
import { ConfirmModal } from "../components/ComfirmModal";
import ModalitiesManager from "../components/ModalitiesManager";
import api from '../services/api';

const GestaoDeAtletas: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedModality, setSelectedModality] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);

  const [showModalitiesManager, setShowModalitiesManager] = useState(false);
  const [enrollmentStates, setEnrollmentStates] = useState<Record<number, any>>({});
  const [editMode, setEditMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const modalitiesManagerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [athletesResp, enrollmentsResp, modalitiesResp] = await Promise.all([
        api.get('/athletes/'),
        api.get('/enrollment/'),
        api.get('/modality/')
      ]);
      setAthletes(athletesResp.data);
      setEnrollments(enrollmentsResp.data);
      setModalities(modalitiesResp.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddOrEdit = async (athlete: Athlete) => {
    try {
      const formData = new FormData();
      Object.entries(athlete).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (athlete.id) {
        await api.put(`/athletes/${athlete.id}`, formData);
      } else {
        await api.post('/athletes/', formData);
      }

      await fetchAllData();
      setSelectedAthlete(null);
    } catch (error) {
      console.error("Erro ao salvar atleta:", error);
      throw error;
    }
  };

  const handleEditClick = async (athlete: Athlete) => {
    try {
      const response = await api.get(`/athletes/${athlete.id}`);
      setSelectedAthlete(response.data);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error('Erro ao buscar atleta para edição:', error);
      alert('Erro ao buscar dados completos do atleta.');
    }
  };

  const handleDeleteClick = (id: number) => {
    setIdParaExcluir(id);
    setModalAberto(true);
  };

  const handleDelete = async () => {
    if (idParaExcluir === null) return;
    try {
      await api.delete(`/athletes/${idParaExcluir}`);
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao deletar atleta:', error);
    } finally {
      setModalAberto(false);
      setIdParaExcluir(null);
    }
  };

  const getAthleteModalities = (athleteId: string | number) => {
    return enrollments
      .filter((enr) => enr.athlete && (enr.athlete.id?.toString() === athleteId?.toString()))
      .map((enr) => enr.modality);
  };

  const filteredAthletes = athletes.filter((athlete) => {
    const searchLower = search.toLowerCase();
    const matchesText =
      athlete.name.toLowerCase().includes(searchLower) ||
      (athlete.rg && athlete.rg.toLowerCase().includes(searchLower)) ||
      athlete.cpf.toLowerCase().includes(searchLower);
    if (!matchesText) return false;
    if (!selectedModality) return true;
    const athleteModalities = getAthleteModalities(athlete.id || "");
    return athleteModalities.some((mod: any) => mod.id?.toString() === selectedModality);
  });

  const handleEnrollmentClick = async (athlete: Athlete) => {
    try {
      setSelectedAthlete(athlete);
      setIsEditing(true);
      
      // Busca as inscrições do atleta usando o endpoint correto
      const response = await api.get('/enrollment', {
        params: {
          athleteId: athlete.id
        }
      });
      
      const athleteEnrollments = response.data || [];
      
      // Inicializa os estados das modalidades
      const states: Record<number, any> = {};
      
      for (const modality of modalities) {
        const existing = athleteEnrollments.find((e: any) => e.modality.id === modality.id);
        states[modality.id] = {
          enrollment: existing ? {
            id: existing.id,
            active: existing.active,
            approved: existing.approved
          } : null,
          loading: false,
          error: null
        };
      }
      
      setEnrollmentStates(states);
      setShowModalitiesManager(true);
      
      // Rola a página até o gerenciador de modalidades
      setTimeout(() => {
        modalitiesManagerRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } catch (error) {
      console.error('Erro ao carregar inscrições do atleta:', error);
      // Mostra uma mensagem de erro para o usuário
      alert('Erro ao carregar as inscrições do atleta. Tente novamente.');
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
            onClose={() => setModalAberto(false)}
            onConfirm={handleDelete}
            message="Tem certeza que deseja excluir este atleta? Confirme com sua senha para continuar."
          />

          <div>
            <h1 className="text-2xl font-bold mb-6">Gestão de Atletas</h1>
            <div className="flex flex-col md:flex-row gap-4 mb-4 bg-[#D9D9D9] border border-black rounded-lg p-4">
              <input
                type="text"
                placeholder="Buscar por nome, RG ou CPF"
                className="border border-black rounded px-3 py-2 w-full md:w-1/2"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                className="cursor-pointer border border-black rounded px-3 py-2 w-full md:w-1/3"
                value={selectedModality}
                onChange={e => setSelectedModality(e.target.value)}
              >
                <option value="">Todas modalidades</option>
                {modalities.map((mod) => (
                  <option key={mod.id} value={mod.id}>{mod.name}</option>
                ))}
              </select>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EB8317]"></div>
              </div>
            ) : (
              <div onClick={(e) => e.stopPropagation()}>
                <AtletasCadastrados
                  athletes={filteredAthletes}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  selectedAthlete={selectedAthlete}
                  onEnrollmentClick={handleEnrollmentClick}
                />
              </div>
            )}
          </div>

          <section ref={formRef}>
            {selectedAthlete && !showModalitiesManager && (
              <FormularioAtletas
                athlete={selectedAthlete}
                onSubmit={handleAddOrEdit}
                onCancel={() => setSelectedAthlete(null)}
              />
            )}
          </section>

          {selectedAthlete && (
            <div ref={modalitiesManagerRef}>
              <ModalitiesManager
                show={showModalitiesManager}
                setShow={setShowModalitiesManager}
                isEditing={isEditing}
                editMode={editMode}
                allModalities={modalities}
                enrollmentStates={enrollmentStates}
                setEnrollmentStates={setEnrollmentStates}
                inscreverEmModalidade={async (modalityId) => {
                  const res = await api.post('/enrollment', {
                    modalityId: modalityId,
                  });
                  return res.data[0]; // Retorna o primeiro item do array
                }}
                updateEnrollmentStatus={async (enrollmentId, data) => {
                  const res = await api.put(`/enrollment/${enrollmentId}`, data);
                  return res.data;
                }}
              />
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

export default GestaoDeAtletas;
