import HeaderBasic from "../components/navigation/HeaderBasic";
import { AppSidebar } from "../components/navigation/AppSidebar-prof";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import ModalidadesInscricao from "../components/ModalidadesInscricao";
import FooterMobile from "../components/navigation/FooterMobile";

export const Modalidade = () => {
    return (
        <SidebarProvider>
            <AppSidebar type="atleta" />
            <SidebarInset>
                <div className="min-h-screen bg-[#F4F6FF]">
                    <HeaderBasic
                        type="usuario"
                        links={[
                            { label: "Home", path: "/home-atleta" },
                            { label: "Faltas", path: "/home-atleta/faltas-atleta" },
                            { label: "Modalidades", path: "/home-atleta/modalidade" },
                        ]}
                    />
                    <div className="p-8">
                        <ModalidadesInscricao />
                    </div>
                    <FooterMobile />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};