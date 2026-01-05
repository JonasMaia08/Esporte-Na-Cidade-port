import * as React from "react";
import HeaderBasic from "../components/navigation/HeaderBasic";
import { useUser, useAuthStatus } from "../hooks/useAuth";
import useNavigateTo from "../hooks/useNavigateTo";
import {
  VisualizarAtendimentos,
  AtendimentosAnteriores,
} from "../components/Atendimentos-professor";
import { AppSidebar } from "../components/navigation/AppSidebar-prof";
import FooterMobile from "../components/navigation/FooterMobile";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useDecodedToken } from "../hooks/useDecodedToken";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";



export function useMediaQuerie() {
  const customBreakpoint = 854;
  const [isMobile, setIsmobile] = React.useState<boolean | undefined>(
    undefined
  );
  React.useEffect(() => {
    const media = window.matchMedia(`(max-width:${customBreakpoint - 1}px)`);
    const onChange = () => {
      setIsmobile(window.innerWidth < customBreakpoint);
    };
    media.addEventListener("change", onChange);
    setIsmobile(window.innerWidth < customBreakpoint);
    return () => {
      media.removeEventListener("change", onChange);
    };
  });
  return !!isMobile;
}

const HomeProfessor = () => {
  const { user, loading, isAuthenticated } = useAuth();


  const { isLoading: authCheckLoading } = useAuthStatus("2");
  const GoTo = useNavigateTo();
  const userType = "professor";
  const userData = useUser();
  //const { fetchUser } = useAuthStatus();
  const decodedToken = useDecodedToken();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1440);
    };

    // Chama inicialmente
    handleResize();

    // Escuta alterações de tamanho
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // console.log("decodedToken:", decodedToken);
  // console.log("localStorage token:", localStorage.getItem("token"));

  // console.log("Current auth state:", {
  //   isAuthenticated,
  //   loading,
  //   user,
  //   token: localStorage.getItem("token"),
  // });


  // console.log("payload: ", userStorage);
  if (loading || authCheckLoading) {
    return <div>Loading...</div>;
  }

  
  return (
    <SidebarProvider>
      <AppSidebar type={userType} />
      <SidebarInset>
        <div className="min-h-screen bg-[#F4F6FF]">
          <HeaderBasic
            type="usuario"
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

          <div className="w-full max-w-7xl pb-24 mt-14 mx-auto px-4 md:px-6 lg:pl-24">
            <h1 className="text-2xl font-bold">
              Olá, Professor(a){" "}
              <span className="text-[#EB8317]">{userData?.name}</span>!
            </h1>
              <div className="flex flex-col lg:flex-row gap-10">
                <VisualizarAtendimentos/>
                <AtendimentosAnteriores/>
              </div>
          
          </div>
          <FooterMobile />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomeProfessor;