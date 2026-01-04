import React, { useState } from "react";
import useNavigateTo from "../../hooks/useNavigateTo";
import { CustomSidebarTrigger } from '../ui/custom-trigger'
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../hooks/useAuth";
import { useDecodedToken } from "../../hooks/useDecodedToken";

interface HeaderBasicProps {
  links?: { label: string; path: string }[];
  type?: "usuario" | "visitante";
  logo?: "show" | "hide";
  user?: {
    name: string;
    profilePicture?: string;
    photo_url?: string;
  };
}

const HeaderBasic: React.FC<HeaderBasicProps> = ({ links = [], type, logo = "show", user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOpenDropdown, setMenuOpenDropdown] = useState(false);

  // Fecha o dropdown de perfil ao clicar fora
  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-perfil')) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);
  const GoTo = useNavigateTo();
  const { logout } = useAuth();
  const userData = useUser();
  const decodedToken = useDecodedToken();

  // Fecha o dropdown Gestão ao clicar fora
  React.useEffect(() => {
    if (!menuOpenDropdown) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-gestao')) {
        setMenuOpenDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenDropdown]);

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    GoTo("/");
    setMenuOpen(false);
  };

  return (
    <header className="w-full bg-white flex items-center justify-between gap-4 px-6 py-4 shadow sticky top-0 z-50">
      <div className="flex items-center md:gap-0 gap-2">
        {type === "usuario" && <CustomSidebarTrigger />}


        <img
          src="https://lh3.googleusercontent.com/proxy/X-B99B9HsP3Lo4ae0nDQMozyMHTcxxdcPINH959IZlOUhqK7j0tdAK-sz09ISiS2c0ew2N4wyhXsHyR5EZ1vqwJKbh0VhZBj7gEfvT4DeFZkKw"
          alt="Logo"
          className="h-10 mr-4 hidden md:block"
        />

        <h1
          className="text-xl font-jockey cursor-pointer"
          onClick={() => GoTo("/")}
        >
          ESPORTE NA CIDADE
        </h1>
      </div>

      <div className="flex gap-3">
        <nav className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => GoTo(link.path)}
              className="text-black font-bold hover:text-[#EB8317] transition-transform"
            >
              {link.label}
            </button>
          ))}
          {/* Dropdown Gestão para gestor */}
          {type === "visitante" && (
            <div className="relative dropdown-gestao">
              <button
                className="text-black font-bold transition-transform flex items-center gap-1"
                onClick={() => setMenuOpenDropdown((v: boolean) => !v)}
                type="button"
              >
                Gestão
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div
                className={`absolute right-1 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50 transform transition-all duration-200 origin-top ${menuOpenDropdown ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
                style={{ minWidth: 150 }}
              >
                <button
                  onClick={() => { setMenuOpenDropdown(false); GoTo("/home-gestor/cadastrar-modalidade"); }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Modalidades
                </button>
                <button
                  onClick={() => { setMenuOpenDropdown(false); GoTo("/home-gestor/atletas"); }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Atletas
                </button>
                <button
                  onClick={() => { setMenuOpenDropdown(false); GoTo("/home-gestor/cadastrar-professor"); }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Professores
                </button>
                <button
                  onClick={() => { setMenuOpenDropdown(false); GoTo("/home-gestor/gestores"); }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Gestores
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Foto de perfil do usuário */}
        <div className="relative dropdown-perfil">
          {logo === "show" && (
            <img
              src={
                user?.photo_url ||
                user?.profilePicture ||
                userData?.photo_url ||
                userData?.profilePicture ||
                "https://via.placeholder.com/40"
              }
              alt={`${userData?.name || user?.name || 'Usuário'}'s profile`}
              className="h-10 w-10 border border-black cursor-pointer rounded-full"
              onClick={handleMenuToggle}
            />
          )}
          <div
            className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-50 transform transition-all duration-200 origin-top ${menuOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
            style={{ minWidth: 180 }}
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold">{userData?.name || user?.name || decodedToken?.name || 'Usuário'}</h3>
              <p className="text-sm text-gray-500">{'Perfil'}</p>
            </div>
            <div className="py-1">
              {decodedToken?.role !== "3" && decodedToken?.role !== "2" && (
                <button
                  onClick={() => {
                    GoTo("/home-atleta/editar-perfil");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Editar Perfil
                </button>
              )}
              {decodedToken?.role === "atleta" && (
                <button
                  onClick={() => {
                    GoTo("/faltas-atleta");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Ver Faltas
                </button>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBasic;