import * as React from "react"
import HeaderBasic from "../components/navigation/HeaderBasic"
import { useIsMobile } from "../hooks/use-mobile";
import useNavigateTo from "../hooks/useNavigateTo";
import { AppSidebar } from '../components/navigation/AppSidebar-prof';
import { Lista, Contador } from "../components/Lista-atletas";
import api from '../services/api';
import FooterMobile from "../components/navigation/FooterMobile";
import {
    SidebarInset,
    SidebarProvider,
} from "../components/ui/sidebar"
import AgendaSemanal from "../components/AgendaSemanal";


const AtletasLista: React.FC = () => {
    const GoTo = useNavigateTo();
    const isMobile = useIsMobile();
    const [alunos, setAlunos] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchAtletas() {
            setLoading(true);
            setError(null);
            try {
                // Busca os atletas inscritos na modalidade do professor logado
                const response = await api.get('/enrollment', {
                    params: { approved: true, active: true }
                });
                // Extrai os atletas das inscrições
                const atletasInscritos = response.data.map((enrollment: any) => {
                    const atleta = enrollment.athlete;
                    return {
                        nome: atleta.name,
                        cpf: atleta.cpf,
                        email: atleta.email,
                        modalidade: enrollment.modality?.name || '',
                        horario: enrollment.modality?.start_time || '',
                        endereco: atleta.address || '',
                        telefone: atleta.phone,
                        nomeResponsavel: atleta.father_name || atleta.responsible_person_name || '',
                        telefoneResponsavel: atleta.father_phone || atleta.responsible_person_phone || '',
                    };
                });
                setAlunos(atletasInscritos);
            } catch (err: any) {
                setError('Erro ao carregar alunos inscritos.');
                setAlunos([]);
            } finally {
                setLoading(false);
            }
        }
        fetchAtletas();
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar type="professor" />
            <SidebarInset>
                <div className="min-h-screen pb-24 bg-[#F4F6FF]">
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
                    <div className="max-w-7xl ml-24 mr-10 mt-12 ">
                        <h1 className="text-2xl font-bold">
                            Atletas Inscritos
                        </h1>
                    </div>
                    
                    <div className='pt-8 '>
                        {loading ? (
                            <div>Carregando atletas...</div>
                        ) : error ? (
                            <div className="text-red-600">{error}</div>
                        ) : (
                            <Lista items={alunos} itemsPerPage={10} />
                        )}
                    </div>
                    <FooterMobile />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AtletasLista;
