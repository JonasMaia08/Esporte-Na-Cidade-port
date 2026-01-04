import React from "react";
import AgendaSemanal from "../components/AgendaSemanal";
import FaltaAtleta from "../components/FaltaAtleta";
import FaltaProfessor from "../components/FaltaProfessor";
import useNavigateTo from "../hooks/useNavigateTo";
import HeaderBasic from "../components/navigation/HeaderBasic";
import FooterMobile from "../components/navigation/FooterMobile";
import { Escala } from "../components/Escala";
import { AppSidebar } from "../components/navigation/AppSidebar-prof";
import { CalendarioCompromissos } from "../components/Comunicados";

import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { useUser } from "../hooks/useAuth";


const HomeGestor = () => {
  const GoTo = useNavigateTo();
  const userType = "gestor";
  const userData = useUser();
  return (
    <SidebarProvider>
      <AppSidebar type="gestor" />
      <SidebarInset>
        <div className="min-h-screen flex flex-col bg-[#F4F6FF] pb-16">
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

          <div className="ml-10 mt-10 pb-6">
            <h2 className="text-4xl font-bold pb-2">
              Olá, Gestor(a){" "}
              <span className="text-[#EB8317]">{userData?.name}</span>
            </h2>
            <div className="items-center flex flex-col ">
              <div className="mt-12 pr-8">
                <Escala />
              </div>
              <div className="mt-12">
                {/* <CalendarioCompromissos type="DisableEdit" /> */}
              </div>
            </div>
          </div>
          <FooterMobile />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomeGestor;
