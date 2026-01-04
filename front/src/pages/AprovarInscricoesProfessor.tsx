import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AppSidebar } from '../components/navigation/AppSidebar-prof';
import HeaderBasic from '../components/navigation/HeaderBasic';
import FooterMobile from '../components/navigation/FooterMobile';
import {
    SidebarInset,
    SidebarProvider,
} from '../components/ui/sidebar';
import AgendaSemanal from '../components/AgendaSemanal';

interface Enrollment {
  id: number;
  approved: boolean;
  athlete: {
    id: number;
    name: string;
    email: string;
  };
  modality: {
    id: number;
    name: string;
  };
}

const AprovarInscricoesProfessor: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const response = await api.get('/enrollment/?approved=false');
      //console.log('Dados recebidos da API:', response.data);
      //console.log('Quantidade de inscrições:', response.data.length);
      //console.log('Primeira inscrição (se disponível):', response.data[0]);
      setEnrollments(response.data);
    } catch (error: any) {
      setStatusMsg('Erro ao buscar inscrições pendentes');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleApprove = async (id: number, approved: boolean) => {
    setActionLoading(id);
    setStatusMsg(null);
    try {
      await api.put(`/enrollment/${id}`, { approved });
      setStatusMsg(approved ? 'Inscrição aprovada!' : 'Inscrição reprovada!');
      fetchEnrollments();
    } catch (error: any) {
      setStatusMsg('Erro ao atualizar inscrição');
    }
    setActionLoading(null);
  };

  if (loading) return (
    <SidebarProvider>
      <AppSidebar type="professor" />
      <SidebarInset>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <HeaderBasic
            type="usuario"
            links={[
              { label: "Home", path: "/home-professor" },
              { label: "Chamada", path: "/home-professor/chamada" },
              { label: "Atletas", path: "/home-professor/lista-atletas" },
              { label: "Aprovar Inscrições", path: "/home-professor/aprovar-inscricoes" }
            ]}
          />
          <main className="flex-1 flex flex-col justify-center items-center">
            <div className="loader"></div>
          </main>
          <FooterMobile />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

  return (
    <SidebarProvider>
      <AppSidebar type="professor" />
      <SidebarInset>
        <div className="min-h-screen bg-[#F4F6FF] pb-24">
          <HeaderBasic
            type="usuario"
            links={[
              { label: "Home", path: "/home-professor" },
              { label: "Chamada", path: "/home-professor/chamada" },
              { label: "Atletas", path: "/home-professor/lista-atletas" },
              { label: "Horário", path: "/home-professor/horario" },
              { label: "Aprovar Inscrições", path: "/home-professor/aprovar-inscricoes" },
            ]}
          />
          <div className="max-w-7xl w-3/4 mx-auto pb-24 mt-14 ">
            <h1 className="text-2xl  font-bold mb-8 ">Inscrições Pendentes</h1>
            {statusMsg && <div className="text-center text-red-600 mb-4">{statusMsg}</div>}
            {enrollments.length === 0 && (
              <div className="bg-white rounded shadow p-8 text-center text-gray-600 border border-black">
                Nenhuma inscrição pendente.
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className=" border border-black bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]  p-6 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="font-bold text-lg mb-2 text-black">
                      {enrollment.athlete && enrollment.athlete.name ? enrollment.athlete.name : <span className="text-red-600">Aluno não informado</span>}
                    </h2>
                    <p className="mb-1 text-black">
                      <span className="font-semibold">Email:</span> {enrollment.athlete && enrollment.athlete.email ? enrollment.athlete.email : <span className="text-red-600">Não informado</span>}
                    </p>
                    <p className="mb-1 text-black">
                      <span className="font-semibold">Modalidade:</span> {enrollment.modality && enrollment.modality.name ? enrollment.modality.name : <span className="text-red-600">Não informada</span>}
                    </p>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      className={`w-full py-2 rounded-lg font-bold text-white transition duration-200 ${actionLoading === enrollment.id ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}
                      disabled={actionLoading === enrollment.id}
                      onClick={() => handleApprove(enrollment.id, true)}
                    >
                      {actionLoading === enrollment.id ? 'Aguarde...' : 'Aprovar'}
                    </button>
    
                  </div>
                </div>
              ))}
            </div>
          </div>
          <FooterMobile />
        </div>
        <style>{`
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #EB8317;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}</style>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AprovarInscricoesProfessor;
