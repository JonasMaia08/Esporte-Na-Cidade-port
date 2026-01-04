import React, { useEffect, useState } from "react";
import ChamadaComp from "../components/ChamadaComp";
import HeaderBasic from "../components/navigation/HeaderBasic";
import { AppSidebar } from "../components/navigation/AppSidebar-prof";
import FooterMobile from "../components/navigation/FooterMobile";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import api from "../services/api";

export interface AtletaAtivos {
  id: number;
  name: string;
  email: string;
  faltas: number;
  presente: boolean;
  photo_url: string;
  status: string;
  modalityId: number;
}

const Chamada: React.FC = () => {
  const userType = "professor";
  const user = {
    name: "",
    profilePicture: "",
  };

  const [atletasAtivos, setAtletasAtivos] = useState<AtletaAtivos[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userStorage = localStorage.getItem("user");

  //console.log(userStorage);

  const userData = userStorage ? JSON.parse(userStorage) : null;

  
  const userModalityId = userData?.modality?.id || null;

  useEffect(() => {
    const fetchAtletasAtivos = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `modality/${userModalityId}/athletes-available`
        );

        const atletasFormatados = response.data.map((atleta: any) => ({
          id: atleta.id,
          name: atleta.name,
          email: atleta.email,
          photo_url: atleta.photo_url,
          faltas: atleta.faltas || 0,
          status: "PRESENTE",
          modalityId: userModalityId,
        }));

        //console.log(atletasFormatados);

        setAtletasAtivos(atletasFormatados);
      } catch (err) {
        console.error("Erro ao buscar atletas ativos:", err);
        setError("Falha ao carregar atletas. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchAtletasAtivos();
  }, [userModalityId]);
  return (
    <SidebarProvider>
      <AppSidebar type="professor" />
      <SidebarInset>
        <div className="min-h-screen bg-[#F4F6FF]">
          <HeaderBasic
            type="usuario"
            user={user}
            links={[
              { label: "Home", path: "/home-professor" },
              { label: "Chamada", path: "/home-professor/chamada" },
              { label: "Atletas", path: "/home-professor/lista-atletas" },
              { label: "Horário", path: "/home-professor/horario" },
              {
                label: "Aprovar Inscrições",
                path: "/home-professor/aprovar-inscricoes",
              },
            ]}
          />
          <div className="mb-10">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando atletas...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <ChamadaComp
              userType={userType}
              initialStudents={atletasAtivos} // Passando os atletas como prop
            />
          )}
          <FooterMobile />
          </div>
          

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Chamada;
