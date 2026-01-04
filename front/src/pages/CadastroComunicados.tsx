import React from "react";
import AgendaSemanal from "../components/AgendaSemanal";
import FaltaAtleta from "../components/FaltaAtleta";
import FaltaProfessor from "../components/FaltaProfessor";
import useNavigateTo from "../hooks/useNavigateTo";
import HeaderBasic from "../components/navigation/HeaderBasic";
import FooterMobile from "../components/navigation/FooterMobile";
import { Escala } from "../components/Escala";
import { AppSidebar } from '../components/navigation/AppSidebar-prof';
import { CalendarioCompromissos } from '../components/Comunicados';

import {
    SidebarInset,
    SidebarProvider,
} from "../components/ui/sidebar"

import { useAuthStatus } from "../hooks/useAuth";

const CadastroComunicados = () => {

    // Garante autenticação automática do gestor
    useAuthStatus("3"); // "3" = gestor

    const GoTo = useNavigateTo();
    const userType = "gestor"
    const user = {
        name: "",
        profilePicture: "",
    };

    return (

        <SidebarProvider>
            <AppSidebar type="gestor" />
            <SidebarInset>
                <div className="min-h-screen flex flex-col  bg-[#F4F6FF] pb-16">
                    <HeaderBasic
                        type="visitante"
                        links={[
                            { label: "Home", path: "/home-gestor" },
                            {
                                label: "Comunicados",
                                path: "/home-gestor/cadastrar-comunicado",
                            },
                            {
                                label: "Modalidades",
                                path: "/home-gestor/cadastrar-modalidade",
                            },
                            {
                                label: "Relatório Geral",
                                path: "/home-gestor/relatorio-geral",
                            },
                        ]}
                    />

                    <div className="  ml-20 mt-10 pb-6">
                        <div className=" items-center flex flex-col ">
                            <div className="mt-12">
                                <CalendarioCompromissos type="EnableEdit" />
                            </div>
                        </div>
                    </div>
                    <FooterMobile />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default CadastroComunicados;
