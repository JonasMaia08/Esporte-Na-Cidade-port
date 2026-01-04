import React from "react";
import styles from "./SliderSwitch.module.css";

interface Modality {
  id: number;
  name: string;
}

export interface Enrollment {
  id: number;
  active: boolean;
  approved: boolean;
  modalityId?: number;
  athleteId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface State {
  enrollment: Enrollment | null;
  loading: boolean;
  error: string | null;
}

interface Props {
  show: boolean;
  isEditing: boolean;
  editMode: boolean;
  allModalities: Modality[];
  enrollmentStates: Record<number, State>;
  setEnrollmentStates: React.Dispatch<React.SetStateAction<Record<number, State>>>;
  setShow: (show: boolean) => void;
  inscreverEmModalidade: (modalityId: number) => Promise<Enrollment>;
  updateEnrollmentStatus: (enrollmentId: number, data: Partial<Enrollment>) => Promise<Enrollment>;
}

const ModalitiesManager: React.FC<Props> = ({
  show,
  isEditing,
  editMode,
  allModalities,
  enrollmentStates,
  setEnrollmentStates,
  setShow,
  inscreverEmModalidade,
  updateEnrollmentStatus
}) => {
  if (!show) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-4 bg-[#D9D9D9] border border-black rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gerenciar inscrições em modalidades</h2>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-black bg-[#D9D9D9] hover:bg-[#EB8317] transition-colors text-lg font-bold"
          aria-label="Voltar para edição de atleta"
        >
          ×
        </button>
      </div>

      {isEditing && (
        <div className="bg-white border border-black rounded-lg p-4 mt-6 shadow-md">
          
          {Object.keys(enrollmentStates).length === 0 ? (
            <div className="text-gray-500">Nenhuma modalidade encontrada.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {allModalities.map((mod) => {
                const state = enrollmentStates[mod.id] || { enrollment: null, loading: false, error: null };
                const isEnrolled = !!state.enrollment;

                const handleToggle = async (field: "active" | "approved" | "enrolled") => {
                  try {
                    setEnrollmentStates(prev => ({
                      ...prev,
                      [mod.id]: { ...state, loading: true, error: null }
                    }));

                    if (field === "enrolled") {
                      if (!isEnrolled) {
                        // Inscrição em nova modalidade
                        const newEnrollment = await inscreverEmModalidade(mod.id);
                        setEnrollmentStates(prev => ({
                          ...prev,
                          [mod.id]: { 
                            enrollment: { 
                              id: newEnrollment.id, 
                              active: newEnrollment.active ?? true, 
                              approved: newEnrollment.approved ?? false 
                            }, 
                            loading: false, 
                            error: null 
                          }
                        }));
                      } else if (state.enrollment) {
                        // Desativar inscrição
                        await updateEnrollmentStatus(state.enrollment.id, { active: false });
                        setEnrollmentStates(prev => ({
                          ...prev,
                          [mod.id]: { enrollment: null, loading: false, error: null }
                        }));
                      }
                    } else {
                      // Atualizar status ativo/aprovado
                      if (!state.enrollment) return;
                      const newValue = !state.enrollment[field];
                      
                      // Atualiza o status no servidor
                      await updateEnrollmentStatus(state.enrollment.id, {
                        [field]: newValue
                      });
                      
                      // Atualiza o estado local
                      setEnrollmentStates(prev => {
                        const currentState = prev[mod.id];
                        if (!currentState.enrollment) return prev;
                        
                        return {
                          ...prev,
                          [mod.id]: { 
                            ...currentState,
                            enrollment: {
                              ...currentState.enrollment,
                              [field]: newValue
                            },
                            loading: false,
                            error: null
                          }
                        };
                      });
                    }
                  } catch (error) {
                    console.error('Erro ao atualizar inscrição:', error);
                    setEnrollmentStates(prev => ({
                      ...prev,
                      [mod.id]: { 
                        ...state, 
                        loading: false, 
                        error: `Erro ao atualizar status ${field}.` 
                      }
                    }));
                  }
                };

                return (
                  <li key={mod.id} className="flex flex-col md:flex-row md:items-center justify-between py-2 gap-2">
                    <span className="font-medium w-48">{mod.name}</span>
                    <div className="flex gap-4 items-center">
                      {/* Inscrito */}
                      <label className="flex items-center gap-1">
                        <span className="flex items-center gap-2">
                          <label className={styles.switch} aria-disabled={state.loading || (isEditing && !editMode)}>
                            <input
                              type="checkbox"
                              checked={isEnrolled}
                              disabled={state.loading || (isEditing && !editMode)}
                              onChange={() => handleToggle("enrolled")}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span>Inscrito</span>
                        </span>
                      </label>

                      {/* Ativo */}
                      <label className="flex items-center gap-1">
                        <span className="flex items-center gap-2">
                          <label className={styles.switch} aria-disabled={!isEnrolled || state.loading || (isEditing && !editMode)}>
                            <input
                              type="checkbox"
                              checked={!!(state.enrollment && state.enrollment.active)}
                              disabled={!isEnrolled || state.loading || (isEditing && !editMode)}
                              onChange={() => handleToggle("active")}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span>Ativo</span>
                        </span>
                      </label>

                      {/* Aprovado */}
                      <label className="flex items-center gap-1">
                        <span className="flex items-center gap-2">
                          <label className={styles.switch} aria-disabled={!isEnrolled || state.loading || (isEditing && !editMode)}>
                            <input
                              type="checkbox"
                              checked={!!(state.enrollment && state.enrollment.approved)}
                              disabled={!isEnrolled || state.loading || (isEditing && !editMode)}
                              onChange={() => handleToggle("approved")}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span>Aprovado</span>
                        </span>
                      </label>

                      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ModalitiesManager;
