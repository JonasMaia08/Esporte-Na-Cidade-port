import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getModalidades, getModalidadesInscritas } from '../services/modality';
import api from '../services/api';
import { inscreverEmModalidade } from "../services/enrollment";
import { useUser } from "../hooks/useAuth";
import CustomButton from "./customButtom";

export default function ModalidadesInscricao() {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inscrevendo, setInscrevendo] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [modalidadesInscritas, setModalidadesInscritas] = useState<number[]>([]);
  const [modalidadesAprovadas, setModalidadesAprovadas] = useState<number[]>([]);
  const [modalidadesBloqueadas, setModalidadesBloqueadas] = useState<number[]>([]);
  const user = useUser();

  useEffect(() => {
    const fetchModalidades = async () => {
      try {
        const data = await getModalidades();
        setModalidades(data);
      } catch (error) {
        setMensagem("Erro ao carregar modalidades");
      } finally {
        setLoading(false);
      }
    };
    fetchModalidades();
  }, []);

  useEffect(() => {
    const fetchModalidadesInscritas = async () => {
      if (!user?.id) return;
      try {
        // Buscar apenas inscrições aprovadas e ativas
        const response = await api.get('/enrollment', {
          params: { approved: true, active: true, userId: user.id }
        });
        const approvedEnrollments = response.data || [];
        const approvedIds = approvedEnrollments.map((enr: any) => enr.modality?.id).filter(Boolean);
        setModalidadesAprovadas(approvedIds);

        // Buscar todas as inscrições (para saber as aguardando aprovação e bloqueadas)
        const allEnrollments = await getModalidadesInscritas(user.id);
        const enrolledIds = allEnrollments.map((enr: any) => enr.modality?.id).filter(Boolean);
        setModalidadesInscritas(enrolledIds);

        // Buscar inscrições aprovadas mas inativas (bloqueadas)
        const bloqueadasIds = allEnrollments
          .filter((enr: any) => enr.approved === true && enr.active === false && enr.modality?.id)
          .map((enr: any) => enr.modality.id);
        setModalidadesBloqueadas(bloqueadasIds);
      } catch (error) {
        // Não bloqueia o fluxo, só loga
        console.warn("Erro ao buscar modalidades inscritas", error);
      }
    };
    fetchModalidadesInscritas();
  }, [user]);

  const handleInscrever = async (modalityId: number) => {
    setInscrevendo(modalityId);
    setMensagem("");
    try {
      await inscreverEmModalidade(modalityId);
      setMensagem("Inscrição realizada com sucesso!");
      setModalidadesInscritas((prev) => [...prev, modalityId]);
    } catch (error: any) {
      if (error?.response?.data?.message) {
        setMensagem(error.response.data.message);
      } else {
        setMensagem("Erro ao inscrever-se na modalidade");
      }
    } finally {
      setInscrevendo(null);
    }
  };

  return (
    <main className="w-full lg:w-3/4 mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold mb-8 text-left ml-4">
        Modalidades Disponíveis
      </h2>
      {mensagem && (
        <div className="mb-4 text-center text-sm text-red-600 font-semibold">{mensagem}</div>
      )}
      {/* Modalidades Disponíveis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {modalidades
          .filter((mod: any) => !modalidadesAprovadas.includes(mod.id) && !modalidadesBloqueadas.includes(mod.id))
          .map((mod: any, index: number) => {
            const inscrito = modalidadesInscritas.includes(mod.id);
            const aprovado = modalidadesAprovadas.includes(mod.id);
            const bloqueado = modalidadesBloqueadas.includes(mod.id);
            return (
              <div
                key={mod.id || index}
                className="bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] m-4 p-6  border border-black  flex flex-col justify-between mb-4"
              >
                <div>
                  <h3 className="text-xl font-semibold text-orange-500 mb-2 uppercase tracking-wide text-center">{mod.name}</h3>
                  <p className="text-gray-700 text-center mb-1">Horário: <span className="font-medium">{mod.start_time} - {mod.end_time}</span></p>
                  <p className="text-gray-500 text-center mb-2">Local: <span className="font-medium">
                    {Array.isArray(mod.class_locations)
                      ? mod.class_locations.join(", ")
                      : typeof mod.class_locations === 'object' && mod.class_locations !== null
                        ? JSON.stringify(mod.class_locations)
                        : mod.class_locations || "-"}
                  </span></p>
                  <p className="text-gray-500 text-center mb-2">Dias: <span className="font-medium">
                    {Array.isArray(mod.days_of_week)
                      ? mod.days_of_week.join(", ")
                      : typeof mod.days_of_week === 'object' && mod.days_of_week !== null
                        ? JSON.stringify(mod.days_of_week)
                        : mod.days_of_week || "-"}
                  </span></p>
                </div>
                {!inscrito && !bloqueado ? (
                  <CustomButton width="w-full" variant="blue" onClick={() => handleInscrever(mod.id)} disabled={inscrevendo === mod.id}  >
                    {inscrevendo === mod.id ? "Inscrevendo..." : "Inscrever-se"}
                  </CustomButton>
                ) : (
                  <CustomButton variant="gray" disabled width="w-full">
                    Aguardando aprovação
                  </CustomButton>
                )}
              </div>
            );
          })}
      </div>

      {/* Modalidades Inscritas (Aprovadas) */}
      {
        modalidadesAprovadas.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-8 text-left ml-4 mt-12">
              Modalidades Inscritas
            </h2>
            <div className="flex flex-col lg:flex-row  gap-4 mb-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8   ">
                {modalidades
                  .filter((mod: any) => modalidadesAprovadas.includes(mod.id))
                  .map((mod: any, index: number) => (
                    <div
                      key={mod.id || index}
                     className="bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] m-4 p-6  border border-black  flex flex-col justify-between mb-4"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-orange-500 mb-2 uppercase tracking-wide text-center">{mod.name}</h3>
                        <div className="flex justify-center mb-2">
                          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-400">Aprovado</span>
                        </div>
                        <p className="text-gray-700 text-center mb-1">Horário: <span className="font-medium">{mod.start_time} - {mod.end_time}</span></p>
                        <p className="text-gray-500 text-center mb-2">Local: <span className="font-medium">
                          {Array.isArray(mod.class_locations)
                            ? mod.class_locations.join(", ")
                            : typeof mod.class_locations === 'object' && mod.class_locations !== null
                              ? JSON.stringify(mod.class_locations)
                              : mod.class_locations || "-"}
                        </span></p>
                        <p className="text-gray-500 text-center mb-2">Dias: <span className="font-medium">
                          {Array.isArray(mod.days_of_week)
                            ? mod.days_of_week.join(", ")
                            : typeof mod.days_of_week === 'object' && mod.days_of_week !== null
                              ? JSON.stringify(mod.days_of_week)
                              : mod.days_of_week || "-"}
                        </span></p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </>
        )
      }

      {/* Modalidades Bloqueadas */}
      {modalidadesBloqueadas.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-8 text-left ml-4 mt-12">Modalidades Bloqueadas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {modalidades
              .filter((mod: any) => modalidadesBloqueadas.includes(mod.id))
              .map((mod: any, index: number) => (
                <div
                  key={mod.id || index}
                  className="bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] m-4 p-6 border border-black flex flex-col justify-between mb-4"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-orange-500 mb-2 uppercase tracking-wide text-center">{mod.name}</h3>
                    <div className="text-center text-red-600 font-semibold mt-2">
                      Inscrição inativa por faltas. Entre em contato com a coordenação.
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      

    </main >
  );
}