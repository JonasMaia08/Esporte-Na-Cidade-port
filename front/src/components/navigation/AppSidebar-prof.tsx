import { Calendar, Home, Inbox, LogOut } from 'lucide-react'
import { CustomSidebarTrigger } from "../ui/custom-trigger"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar"
import { text } from 'stream/consumers';
import { useState } from 'react';
import useNavigateTo from '../../hooks/useNavigateTo';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../hooks/useAuth';
import { useDecodedToken } from '../../hooks/useDecodedToken';


interface SidebarProps {
  type: "professor" | "atleta" | "gestor";
}

export const AppSidebar: React.FC<SidebarProps> = ({ type }) => {
  const GoTo = useNavigateTo();
  const { logout } = useAuth();
  const userData = useUser();
  const decodedToken = useDecodedToken();

  const handleLogout = () => {
    logout();
    GoTo("/")
  };


  //links
  const iconItems = [
    { title: "Sair", icon: LogOut, action: handleLogout },
    { title: "Calendario", url: "#", icon: Calendar },
  ];
  const navLinksProfessor = [
    { href: "/home-professor", text: "Home" },
    { href: "/home-professor/chamada", text: "Chamada" },
    { href: "/home-professor/lista-atletas", text: "Atletas" },
    { href: "/home-professor/aprovar-inscricoes", text: "Aprovar inscrições" },
  ];


  const navLinksAtleta = [
    { href: "/home-atleta", text: "Home" },
    { href: "/home-atleta/faltas-atleta", text: "Faltas" },
    { href: "/home-atleta/modalidade", text: "Modalidades" },
  ];


  const navLinksGestor = [
    { href: "/home-gestor", text: "Home" },
    { href: "/home-gestor/cadastrar-professor", text: "professores" },
    { href: "/home-gestor/cadastrar-comunicado", text: "comunicados" },
    { href: "/home-gestor/cadastrar-modalidade", text: "modalidades" }
  ];




  const navLinks = type === "professor" ? navLinksProfessor : type === "atleta" ? navLinksAtleta : navLinksGestor;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center space-x-2">
            <CustomSidebarTrigger />
            <img
              src="https://lh3.googleusercontent.com/proxy/X-B99B9HsP3Lo4ae0nDQMozyMHTcxxdcPINH959IZlOUhqK7j0tdAK-sz09ISiS2c0ew2N4wyhXsHyR5EZ1vqwJKbh0VhZBj7gEfvT4DeFZkKw"
              alt="Logo"
              className="h-10"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {iconItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    {item.action ? (
                      <button
                        onClick={item.action}
                        className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 w-full text-left"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </button>
                    ) : (
                      <a
                        href={item.url}
                        className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </a>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>


            <SidebarMenu>
              {navLinks.map((link, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <a href={link.href} className="text-gray-700 hover:text-orange-500">
                      {link.text}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

