import React, { useEffect, useState } from "react";
import HeaderBasic from "../components/navigation/HeaderBasic";
import { AppSidebar } from "../components/navigation/AppSidebar-prof";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import axios from "axios";
import { useUser } from "../hooks/useAuth";
import api from "../services/api";
import FooterMobile from "../components/navigation/FooterMobile";


interface Falta {
  data: string;
  modalidade: string;
  professor: string;
  local: string;
}

interface Modality {
  id: number;
  name: string;
}

const AtletaFaltas = () => {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [totalFaltas, setTotalFaltas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ modalityId: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Get authenticated user data
  const user = useUser();
  //console.log(user);

  useEffect(() => {
    const fetchFaltas = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.name) {
          throw new Error("acesso negado");
        }

        // Properly encode the athlete name in the URL
        let endpoint = `absences?athlete=${user.name}`
        //url.searchParams.append("athlete", encodeURIComponent(user.name));

        if (filters.modalityId) {
          endpoint.concat(`&modality=${filters.modalityId}`)
        }
        const url = await api.get(`${endpoint}`);


        const response = await api.get(endpoint.toString(), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setFaltas(response.data.absences || []);
        setTotalFaltas(response.data.totalAbsences || 0);

        if (response.data.modalities && !modalities.length) {
          setModalities(response.data.modalities);
          console.log("data: ", response);
          
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("falha no carregamento");
      } finally {
        setLoading(false);
      }
    };

    fetchFaltas();
  }, [filters.modalityId, user?.name]);

  const filteredFaltas = faltas.filter((falta) => {
    return (
      filters.modalityId === "" ||
      falta.modalidade ===
      modalities.find((m) => m.id.toString() === filters.modalityId)?.name
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFaltas = filteredFaltas.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredFaltas.length / itemsPerPage);

  const handleModalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, modalityId: e.target.value });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  function formatDate(dateStr: string) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }

  return (
    <SidebarProvider>
      <AppSidebar type="atleta" />
      <SidebarInset>
        <div className="min-h-screen bg-[#F4F6FF] ">
          <HeaderBasic
            type="usuario"
            links={[
              { label: "Home", path: "/home-atleta" },
              { label: "Faltas", path: "/home-atleta/faltas-atleta" },
              { label: "Modalidades", path: "/home-atleta/modalidade" }
            ]}
          />
          <main className="px-4 py-6 md:px-8 w-3/4 m-auto">
            <div className="text-2xl font-bold mb-4 ml-4 my-10">Suas Faltas</div>

            {loading && (
              <div className="text-center py-8">Carregando dados...</div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="flex flex-col justify-start ">

                  <section className="mb-8 p-6 bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] m-4 border border-black  flex flex-col justify-between">
                    <div className="text-xl font-bold">
                      Número total de faltas:
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-6xl font-bold text-[#EB8317]">
                        {String(totalFaltas).padStart(2, "0")}
                      </div>
                      {/* <div className="text-gray-600">
                        Número de faltas permitidas:{" "}
                        <span className="font-semibold">3</span>
                      </div> */}
                    </div>
                  </section>


                  {/* Filtros */}
                  <section className="flex flex-wrap gap-4 mb-8 m-4    " >
                    <select
                      className="hover:cursor-pointer  transition-all   min-w-44 w-1/3 md:w-1/6 px-4 py-2 bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]  border border-black  flex flex-col justify-between"
                      value={filters.modalityId}
                      onChange={handleModalityChange}
                    >
                      <option value="">Todas modalidades</option>
                      {modalities.map((modality) => (
                        <option key={modality.id} value={modality.id}>
                          {modality.name}
                        </option>
                      ))}
                    </select>
                  </section>

                  {/* Tabela */}

                  <section className="mb-8 p-6 bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] m-4 border border-black  flex flex-col  ">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left border-b border-black">
                            Data
                          </th>
                          <th className="px-4 py-2 text-left border-b border-black">
                            Modalidade
                          </th>
                          {/* <th className="px-4 py-2 text-left border-b border-black">
                          Professor
                        </th>
                        <th className="px-4 py-2 text-left border-b border-black">
                          Local
                        </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {currentFaltas.map((falta, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 border-b">{formatDate(falta.data)}</td>
                            <td className="px-4 py-2 border-b">
                              {falta.modalidade}
                            </td>
                            {/* <td className="px-4 py-2 border-b">
                            {falta.professor}
                          </td>
                          <td className="px-4 py-2 border-b">{falta.local}</td> */}
                          </tr>
                        ))}
                        {currentFaltas.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-2 text-center text-gray-500"
                            >
                              Nenhuma falta
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </section>


                  {/* Paginação */}
                  <section className="flex items-center justify-between">
                    <span className="font-bold text-sm ms-4">
                      Página {currentPage} de {totalPages}
                    </span>

                    <div className="flex justify-end items-center mt-4 ">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={`px-4 py-2 rounded-l-md border border-black ${currentPage === 1
                          ? "bg-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-not-allowed"
                          : "bg-[#EB8317] text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-transform hover:-translate-x-1 hover:translate-y-1 hover:shadow-none"
                          }`}
                        disabled={currentPage === 1}
                      >
                        &lt;
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        className={`px-4 py-2 rounded-r-md border border-black ${currentPage === totalPages
                          ? "bg-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-not-allowed"
                          : "bg-[#EB8317] text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-transform hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                          }`}
                        disabled={currentPage === totalPages}
                      >
                        &gt;
                      </button>
                    </div>
                  </section>
                </div>
              </>
            )}
          </main>
          <FooterMobile />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AtletaFaltas;