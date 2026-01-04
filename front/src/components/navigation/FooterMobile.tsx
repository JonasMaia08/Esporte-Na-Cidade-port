import React from "react";
import { useLocation } from "react-router-dom";
import useNavigateTo from "../../hooks/useNavigateTo";

interface FooterMobileProps {
  links?: { label: string; path: string; icon?: JSX.Element }[]; // Ícones opcionais
}

// aqui eui mexi bastante basicamente troquei aqui para ter as trotas que estavam faltando e renderizar de acordo com o usuario mas to usando a mesma logica de usar 
// as rotas como uma forma de determinar o acesso o que o usuario deve ver tem como trocar as coisas se mexer no dynamic links como imagens e rotas mas acredito que não va precisar
// e troquei as rotas quase todas para acomodar com essa abordagem agr todas as paginas relacionadas a um usuario vem com um "prefixo" exemplo a rota para chamada:
// passou de /chamada para home-prrofessor/chamada    // para lidar com a renderização se quiser ver melhor abre o AppRoutes

//codigo

const FooterMobile: React.FC<FooterMobileProps> = ({ links = [] }) => {
  const location = useLocation();
  const GoTo = useNavigateTo();


  const dynamicLinks = () => {
    switch (true) {
      //atleta
      case location.pathname.startsWith("/home-atleta"):
        return [
          {
            label: "Home",
            path: "/home-atleta",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48">
                <path d="M39.5,43h-9c-1.381,0-2.5-1.119-2.5-2.5v-9c0-1.105-0.895-2-2-2h-4c-1.105,0-2,0.895-2,2v9c0,1.381-1.119,2.5-2.5,2.5h-9	C7.119,43,6,41.881,6,40.5V21.413c0-2.299,1.054-4.471,2.859-5.893L23.071,4.321c0.545-0.428,1.313-0.428,1.857,0L39.142,15.52	C40.947,16.942,42,19.113,42,21.411V40.5C42,41.881,40.881,43,39.5,43z"></path>
              </svg>
            ),
          },
          {
            label: "Faltas",
            path: "/home-atleta/faltas-atleta",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16">
                <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" />
              </svg>
            ),
          },
          {
            label: "Modalidades",
            path: "/home-atleta/modalidade",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48">
                <path d="M 17.5 4 C 15.190108 4 13.30317 5.756334 13.050781 8 L 10.5 8 C 8.5850452 8 7 9.5850452 7 11.5 L 7 17.5 C 7 21.071938 9.9280619 24 13.5 24 L 13.548828 24 C 14.885791 28.172832 18.546016 31.306266 23 31.890625 L 23 35 L 19.5 35 C 15.916 35 13 37.916 13 41.5 L 13 42.5 C 13 43.329 13.671 44 14.5 44 L 34.5 44 C 35.329 44 36 43.329 36 42.5 L 36 41.5 C 36 37.916 33.084 35 29.5 35 L 26 35 L 26 31.890625 C 30.453984 31.306266 34.114209 28.172832 35.451172 24 L 35.5 24 C 39.071938 24 42 21.071938 42 17.5 L 42 11.5 C 42 9.5850452 40.414955 8 38.5 8 L 35.949219 8 C 35.69683 5.756334 33.809892 4 31.5 4 L 17.5 4 z"></path>
              </svg>
            ),
          },
          
        ];

      //professor
      case location.pathname.startsWith("/home-professor"):
        return [
          {
            label: "Home",
            path: "/home-professor",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48">
                <path d="M39.5,43h-9c-1.381,0-2.5-1.119-2.5-2.5v-9c0-1.105-0.895-2-2-2h-4c-1.105,0-2,0.895-2,2v9c0,1.381-1.119,2.5-2.5,2.5h-9	C7.119,43,6,41.881,6,40.5V21.413c0-2.299,1.054-4.471,2.859-5.893L23.071,4.321c0.545-0.428,1.313-0.428,1.857,0L39.142,15.52	C40.947,16.942,42,19.113,42,21.411V40.5C42,41.881,40.881,43,39.5,43z"></path>
              </svg>
            ),
          },
          {
            label: "Chamadas",
            path: "/home-professor/chamada",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z" /></svg>
            ),
          },
          {
            label: "Atletas",
            path: "/home-professor/lista-atletas",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 640 512"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z" /></svg>
            ),
          },
          {
            label: "Inscrições",
            path: "/home-professor/aprovar-inscricoes",
            icon: (
              <img
                    src="/icon/adicionar-usuario.svg"
                    alt="Deletar"
                    className="w-6 h-6"
                />
            ),
          },
        ];

      //gestor
      case location.pathname.startsWith("/home-gestor"):
        return [
          { label: "Home", 
            path: "/home-gestor",  
            icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48">
              <path d="M39.5,43h-9c-1.381,0-2.5-1.119-2.5-2.5v-9c0-1.105-0.895-2-2-2h-4c-1.105,0-2,0.895-2,2v9c0,1.381-1.119,2.5-2.5,2.5h-9	C7.119,43,6,41.881,6,40.5V21.413c0-2.299,1.054-4.471,2.859-5.893L23.071,4.321c0.545-0.428,1.313-0.428,1.857,0L39.142,15.52	C40.947,16.942,42,19.113,42,21.411V40.5C42,41.881,40.881,43,39.5,43z"></path>
            </svg>
          ), },
          {
            label: "Comunicados",
            path: "/home-gestor/cadastrar-comunicado",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><path d="M480 32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9L381.7 53c-48 48-113.1 75-181 75l-8.7 0-32 0-96 0c-35.3 0-64 28.7-64 64l0 96c0 35.3 28.7 64 64 64l0 128c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-128 8.7 0c67.9 0 133 27 181 75l43.6 43.6c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-147.6c18.6-8.8 32-32.5 32-60.4s-13.4-51.6-32-60.4L480 32zm-64 76.7L416 240l0 131.3C357.2 317.8 280.5 288 200.7 288l-8.7 0 0-96 8.7 0c79.8 0 156.5-29.8 215.3-83.3z" /></svg>
            ),
          },
          {
            label: "Professores",
            path: "/home-gestor/professores",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 640 512"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z" /></svg>
            ),
          },

          {
            label: "Modalidades",
            path: "/home-gestor/cadastrar-modalidade",
            icon: (
              <img width="25" height="25" src="https://img.icons8.com/ios-glyphs/30/basketball--v1.png" alt="basketball--v1"/>
            ),
          }
        ];
      default:
        return [];
    }
  };

  const allLinks = dynamicLinks();

  return (
    <footer className="fixed bottom-0 w-full p-4 bg-[#F4F6FF] border-t border-gray-200 shadow-inner flex justify-around py-3 md:hidden gap-4 z-50">
      {allLinks.map((link, index) => (
        <button
          key={index}
          onClick={() => GoTo(link.path)}
          className="bg-[#d9d9d9] flex-1 flex flex-col items-center text-black shadow-md rounded-md py-1 border border-black hover:bg-[#EB8317] transition-transform"
        >
          {link.icon}
          <span className="text-xs">{link.label}</span>
        </button>
      ))}
    </footer>
  );
};

// return (
//   <footer className="fixed bottom-0 w-full bg-[#F4F6FF] border-t border-gray-200 shadow-inner flex justify-around py-3 md:hidden gap-4">
//       <button onClick={() => GoTo("/home")} className=" bg-[#d9d9d9] flex-1 flex flex-col items-center text-black shadow-md rounded-md py-1 bg-[#F4F6FF] border border-black ml-2 hover:bg-[#EB8317] transition-transform">
//         <i className="material-icons"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
//           <path d="M39.5,43h-9c-1.381,0-2.5-1.119-2.5-2.5v-9c0-1.105-0.895-2-2-2h-4c-1.105,0-2,0.895-2,2v9c0,1.381-1.119,2.5-2.5,2.5h-9	C7.119,43,6,41.881,6,40.5V21.413c0-2.299,1.054-4.471,2.859-5.893L23.071,4.321c0.545-0.428,1.313-0.428,1.857,0L39.142,15.52	C40.947,16.942,42,19.113,42,21.411V40.5C42,41.881,40.881,43,39.5,43z"></path>
//         </svg></i>
//         <span className="text-xs">Home</span>
//       </button>
//       <button onClick={() => GoTo("/faltas-atleta")} className="bg-[#d9d9d9] flex-1 flex flex-col items-center text-black shadow-md rounded-md py-1 bg-[#F4F6FF] border border-black hover:bg-[#EB8317] transition-transform">
//         <i className="material-icons"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16">
//           <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" />
//         </svg></i>
//         <span className="text-xs">Faltas</span>
//       </button>
//       <button onClick={() => GoTo("/faltas-atleta")} className="bg-[#d9d9d9] flex-1 flex flex-col items-center text-black shadow-md rounded-md py-1 bg-[#F4F6FF] border border-black hover:bg-[#EB8317] transition-transform">
//         <i className="material-icons"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
//           <path d="M 17.5 4 C 15.190108 4 13.30317 5.756334 13.050781 8 L 10.5 8 C 8.5850452 8 7 9.5850452 7 11.5 L 7 17.5 C 7 21.071938 9.9280619 24 13.5 24 L 13.548828 24 C 14.885791 28.172832 18.546016 31.306266 23 31.890625 L 23 35 L 19.5 35 C 15.916 35 13 37.916 13 41.5 L 13 42.5 C 13 43.329 13.671 44 14.5 44 L 34.5 44 C 35.329 44 36 43.329 36 42.5 L 36 41.5 C 36 37.916 33.084 35 29.5 35 L 26 35 L 26 31.890625 C 30.453984 31.306266 34.114209 28.172832 35.451172 24 L 35.5 24 C 39.071938 24 42 21.071938 42 17.5 L 42 11.5 C 42 9.5850452 40.414955 8 38.5 8 L 35.949219 8 C 35.69683 5.756334 33.809892 4 31.5 4 L 17.5 4 z M 10.5 11 L 13 11 L 13 20.5 C 13 20.653 13.017486 20.801558 13.023438 20.953125 C 11.305593 20.722554 10 19.286673 10 17.5 L 10 11.5 C 10 11.204955 10.204955 11 10.5 11 z M 36 11 L 38.5 11 C 38.795045 11 39 11.204955 39 11.5 L 39 17.5 C 39 19.286673 37.694407 20.722554 35.976562 20.953125 C 35.982514 20.801558 36 20.653 36 20.5 L 36 11 z"></path>
//         </svg></i>
//         <span className="text-xs">Modalidades</span>
//       </button>
//       <button onClick={() => GoTo("/calendario")} className="bg-[#d9d9d9] flex-1 flex flex-col items-center text-black shadow-md rounded-md py-1 bg-[#F4F6FF] border border-black mr-2 hover:bg-[#EB8317] transition-transform">
//         <i className="material-icons"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 48 48">
//           <path d="M42 14v-1.5C42 8.916 39.084 6 35.5 6h-23C8.916 6 6 8.916 6 12.5V14H42zM6 17v18.5c0 3.584 2.916 6.5 6.5 6.5h23c3.584 0 6.5-2.916 6.5-6.5V17H6zM15.5 36c-1.381 0-2.5-1.119-2.5-2.5 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5C18 34.881 16.881 36 15.5 36zM15.5 27c-1.381 0-2.5-1.119-2.5-2.5 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5C18 25.881 16.881 27 15.5 27zM24 36c-1.381 0-2.5-1.119-2.5-2.5 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5C26.5 34.881 25.381 36 24 36zM24 27c-1.381 0-2.5-1.119-2.5-2.5 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5C26.5 25.881 25.381 27 24 27zM32.5 27c-1.381 0-2.5-1.119-2.5-2.5 0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5C35 25.881 33.881 27 32.5 27z"></path>
//         </svg></i>
//         <span className="text-xs">Calendário</span>
//       </button>
//     </footer>
// );
// }

export default FooterMobile;
