import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "../components/ui/button";
import api from "../services/api";
import { useAuth } from '../contexts/AuthContext';
import { Atendiment } from "../types/Atendiments";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronDown, } from 'lucide-react'
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { format } from "date-fns"
import { getScheduleTeacher } from "../services/schedule";
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "./ui/carousel"
import { useUser } from "../hooks/useAuth";
import { useDecodedToken } from "../hooks/useDecodedToken";
import { getAtendiments } from "../services/modality";
import useNavigateTo from "../hooks/useNavigateTo";
import { cn } from "../lib/utils";


interface ScheduleItem {
    name: string;
    time: string;
    date: string;
}

interface ScheduleSection {
    title: string;
    items: ScheduleItem[];
}

interface BackendSchedule {
    name: string;
    time: string;
    date: Date;
}

interface BackendScheduleResponse {
    today: BackendSchedule[];
    tomorrow: BackendSchedule[];
}

interface FullSchedule {
    id: number;
    name: string;
    time: string;
    date: Date;
    teacher: {
        id: number;
        name: string;
    };
}

interface FullScheduleResponse {
    today: FullSchedule[];
    tomorrow: FullSchedule[];
}

interface Attendance {
    data: string;
    local: string;
    atendimento: string;
}

interface CardItem {
    modalidade: string
    quantidade: number
}

interface ContentItem {
    title: string
    items: CardItem[]
}

dayjs.locale('pt-br');

const attendances: Attendance[] = [
    { data: "10/12/2023", local: "Raspadão", atendimento: "Futebol" },
    { data: "11/12/2023", local: "Quadra Coberta", atendimento: "Basquete" },
    { data: "12/12/2023", local: "Piscina Olímpica", atendimento: "Natação" },
    { data: "13/12/2023", local: "Raspadão", atendimento: "Futebol" },
    { data: "14/12/2023", local: "Quadra de Tênis", atendimento: "Tênis" },
    { data: "15/12/2023", local: "Pista de Atletismo", atendimento: "Atletismo" },
    { data: "16/12/2023", local: "Ginásio", atendimento: "Vôlei" },
    { data: "17/12/2023", local: "Raspadão", atendimento: "Futebol" },
    { data: "18/12/2023", local: "Quadra Coberta", atendimento: "Basquete" },
    { data: "19/12/2023", local: "Piscina Olímpica", atendimento: "Natação" },
    { data: "20/12/2023", local: "Quadra de Tênis", atendimento: "Tênis" },
    { data: "21/12/2023", local: "Pista de Atletismo", atendimento: "Atletismo" },
]

const locations = Array.from(new Set(attendances.map(a => a.local)));
const dayMap: Record<string, string> = {
    dom: 'Domingo',
    seg: 'Segunda',
    ter: 'Terça',
    qua: 'Quarta',
    qui: 'Quinta',
    sex: 'Sexta',
    sab: 'Sábado',
};



const getDiasHojeEAmanha = () => {
    const hoje = dayjs();
    const amanha = hoje.add(1, 'day');

    const hojeAbrev = hoje.format('ddd').toLowerCase(); // já com locale pt-br, 'ter'
    const amanhaAbrev = amanha.format('ddd').toLowerCase(); // 'qua'

    return {
        hoje: hojeAbrev,
        amanha: amanhaAbrev
    };
};
const { hoje, amanha } = getDiasHojeEAmanha();


export const VisualizarAtendimentos = () => {
    const GoTo = useNavigateTo();
    const user = useAuth()
    const userData = useUser();

    //console.log(userData);




    const decodedToken = useDecodedToken();
    const [loading, setLoading] = useState(true);
    const [formattedSchedule, setFormattedSchedule] = useState<any[]>([]);

    const { hoje, amanha } = getDiasHojeEAmanha();

    const fetchScheduleTeacher = async () => {
        try {
            setLoading(true);

            //console.log("asdasdsad\n\n\n\n\n", userData?.name);


            if (!userData) return;
            const token = localStorage.getItem("token");
            if (!token) return;

            const responseData = await getScheduleTeacher(token);
            const scheduleArray = Array.isArray(responseData)
                ? responseData
                : responseData ? [responseData] : [];

            const formatted = scheduleArray.map((classInfo: any) => {
                const days = typeof classInfo.days === 'string'
                    ? classInfo.days.split(',').map((d: string) => d.trim())
                    : [];

                return days.map((day: string) => ({
                    dia: day, // manter a abreviação original para comparação direta
                    modalidade: classInfo.name,
                    horario: `${classInfo.start_time} - ${classInfo.end_time}`,
                    local: Array.isArray(classInfo.class_locations)
                        ? classInfo.class_locations.join(', ')
                        : classInfo.class_locations || 'Local não especificado',
                }));
            }).flat();

            setFormattedSchedule(formatted);
            //console.log("formatado: ", formatted)
        } catch (error: any) {
            console.error("Erro ao buscar horário do professor:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScheduleTeacher();
    }, []);

    //console.log('Hoje (abrev):', hoje);
    //console.log('Amanhã (abrev):', amanha);

    //console.log('Dias no formattedSchedule:');
    formattedSchedule.forEach((aula, i) => {
        //console.log(i, 'dia:', aula.dia, '| comparação com hoje:', aula.dia === hoje, '| comparação com amanhã:', aula.dia === amanha);
    });

    const filtrarAulasPorDia = (dia: string) => {
        return formattedSchedule.filter(aula => aula.dia === dia);
    };

    const aulasHoje = filtrarAulasPorDia(hoje);
    const aulasAmanha = filtrarAulasPorDia(amanha);

    //console.log('aulasHoje:', aulasHoje);
    //console.log('aulasAmanha:', aulasAmanha);

    const [animateTable, setAnimateTable] = useState(false)

    useEffect(() => {
        // Aciona a animação levemente após o componente montar
        const timeout = setTimeout(() => setAnimateTable(true), 50)
        return () => clearTimeout(timeout)
    }, [])


    const renderCarousel = (aulas: any[], titulo: string) => (
        <div className=" mt-4 items-center align-middle justify-center cursor-pointer transition-all" onClick={() => GoTo("/home-professor/horario")}>
            <h2 className="text-lg font-semibold text-start mb-4">{titulo}</h2>
            {aulas.length === 0 ? (

                //sem Aulas 
                <>

                    <Card>
                        <CardContent className="transition-all bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] min-h-32 p-6 border min-w-52 border-black ">
                            <p>Sem aulas hoje!</p>

                        </CardContent>
                    </Card>

                    {/* <CarouselPrevious className="bg-[#d9d9d9] shadow-none border-none hover:bg-orange-500" />
                        <CarouselNext className="bg-[#d9d9d9] shadow-none border-none hover:bg-orange-500" /> */}

                </>
            ) : (
                <>
                    <Carousel opts={{ align: "start" }} className="transition-all w-full max-w-3xl">
                        <CarouselContent className="transition-all">
                            {aulas.map((aula, index) => (
                                <CarouselItem key={index} className="transition-all basis-1/2 min-w-36">
                                    <div className="p-1">
                                        <Card>
                                            <CardContent className="bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] min-h-32 p-6 border min-w-52 border-black">
                                                <p>{aula.modalidade}</p>
                                                <p className="text-orange-500">{aula.horario}</p>
                                                <p className="text-sm text-gray-600">{aula.local}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {/* <CarouselPrevious className="bg-[#d9d9d9] shadow-none border-none hover:bg-orange-500" />
                        <CarouselNext className="bg-[#d9d9d9] shadow-none border-none hover:bg-orange-500" /> */}
                    </Carousel>
                </>
            )}
        </div>
    );

    return (
        <div className="mt-10 flex flex-col gap-8 sm:max-w-96 self-center md:self-start">
            <div className="bg-[#d9d9d9] border border-black p-4 rounded-sm sm:min-w-0">

                <h1 className="text-lg font-bold">Horário</h1>
                {loading ? (
                    <p>Carregando...</p>
                ) : formattedSchedule.length === 0 ? (
                    <p>Nenhuma aula encontrada</p>
                ) : (
                    <>
                        {renderCarousel(aulasHoje, `Aulas de hoje (${hoje.toUpperCase()})`)}
                        {renderCarousel(aulasAmanha, `Aulas de amanhã (${amanha.toUpperCase()})`)}
                    </>
                )}
            </div>
        </div>
    );
};


export const AtendimentosAnteriores = () => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalAtendiments, setTotalAtendiments] = useState<number>(0);
    const [Atendiments, setAtendiments] = useState<Atendiment[]>([]);
    const [allAtendiments, setAllAtendiments] = useState<Atendiment[]>([]);
    const [locations, setLocations] = useState<string[]>([]);

    const userData = useUser();
    console.log('userData:', userData);

    const teacherId = userData?.id


    useEffect(() => {
        const fetchAtendiments = async () => {
            try {
                if (typeof teacherId === 'number') {
                    const data = await getAtendiments(teacherId);
                    setTotalAtendiments(data.length);
                    setAllAtendiments(data);
                    setAtendiments(data)
                    const allLocations = data.flatMap((item: any) =>
                        item.local.split(',').map((loc: any) => loc.trim())
                    );
                    const uniqueLocations: string[] = [];
                    allLocations.forEach((loc: any) => {
                        if (!uniqueLocations.includes(loc)) {
                            uniqueLocations.push(loc);
                        }
                    });
                }

            } catch (error) {
                console.error("Erro ao buscar atendimentos:", error);
            }
        };

        fetchAtendiments();
    }, [teacherId]);
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate, selectedLocation]);

    //filtro por data
    const filteredByDate = selectedDate
        ? allAtendiments.filter(item => {
            const itemDate = new Date(item.created_at);
            return (
                itemDate.getDate() === selectedDate.getDate() &&
                itemDate.getMonth() === selectedDate.getMonth() &&
                itemDate.getFullYear() === selectedDate.getFullYear()
            );
        })
        : allAtendiments;

    // Filtrar por local
    const filteredAtendiments = selectedLocation !== 'all'
        ? filteredByDate.filter(item =>
            item.local
                .split(',')
                .map(loc => loc.trim().toLowerCase())
                .includes(selectedLocation.toLowerCase())
        )
        : filteredByDate;


    // controle de paginas    
    const pageMax = 7
    const totalFiltered = filteredAtendiments.length;
    const totalPages = Math.ceil(totalFiltered / pageMax);
    const currentItems = filteredAtendiments.slice(
        (currentPage - 1) * pageMax,
        currentPage * pageMax
    );
    const [animateTable, setAnimateTable] = useState(false)

    useEffect(() => {
        // Aciona a animação levemente após o componente montar
        const timeout = setTimeout(() => setAnimateTable(true), 50)
        return () => clearTimeout(timeout)
    }, [currentPage])


    // console.log("data:   ", Atendiments)
    // console.log("currentItems:   ", currentItems)

    return (
        <div className=" transition-all mt-10 w-full max-w-[1000px] mx-auto min-h-[720px] border border-black p-4 bg-[#d9d9d9] rounded-sm">
            <h2 className=" transition-all text-lg font-semibold mb-4">Atendimentos Anteriores</h2>
            <div className=" transition-all flex flex-col sm:flex-row gap-4 mb-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="transition-all w-full sm:w-40 bg-white rounded-lg hover:bg-slate-200   shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center font-normal  border border-black">
                            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Data</span>}
                            <ChevronDown className="ml-2 h-4 w-4 hover:shadow-lg hover:shadow-slate-900" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Calendar
                            mode="single"
                            locale={ptBR}
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <Select onValueChange={(value) => setSelectedLocation(value)}>
                    <SelectTrigger className="transition-all bg-white w-full rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-200  flex justify-between items-center font-normal h-[3.1rem] border border-black">
                        <SelectValue placeholder="Local" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all">Todos os locais</SelectItem>
                        {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                                {location}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="ghost"
                    className="transition-all hover:bg-slate-200   bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex w-40 justify-between items-center font-normal  border border-black"
                    onClick={() => {
                        setSelectedDate(undefined);
                        setSelectedLocation('all');
                    }}
                >
                    Limpar filtros
                </Button>
            </div>

            <Card className=" transition-all mb-4 bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black transition-colors">
                <CardContent className=" transition-all p-5 flex justify-between items-center rounded-md">
                    <p>
                        <span className="font-inter">Modalidade:</span>{" "}
                        <span className="font-semibold">
                            {userData?.modality?.name || 'Não informada'}
                        </span>
                    </p>
                    <p className="text-orange-500 font-bold text-lg">{totalFiltered}</p>
                </CardContent>
            </Card>


            <div key={currentPage} // forçar a reinicialização da animação a cada página
                className={cn(
                    "transition-all duration-500 ease-out min-h-[445px] bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black p-4",
                    animateTable
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                )}
            >



                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-10 font-semibold text-gray-700 mb-2 transition-all">
                    <p className="transition-all border-b-2 border-black pb-2">Data</p>
                    <p className="transition-all border-b-2 border-black pb-2">Local</p>
                    <p className="transition-all border-b-2 border-black pb-2">Descrição</p>
                </div>
                {currentItems.map((item: any) => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-10 py-2 border-t border-gray-200 transition-all">
                        {/* data */}
                        <p className=" transition-all">{new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
                        {/* local */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="trincate max-w-[250px] cursor-pointer">{item.local}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                                {item.local}
                            </TooltipContent>
                        </Tooltip>
                        {/* descrição */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="truncate max-w-[250px] cursor-pointer">
                                    {item.description}
                                </p>
                            </TooltipTrigger>
                            <TooltipContent>
                                {item.description}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                ))}
            </div>


            <div className="flex justify-evenly items-center mt-4">

                <span>
                    Página {currentPage} de {totalPages}
                </span>
                <div className=" space-x-0.5">
                    <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border border-black text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
                                ${currentPage === 1
                                ? "bg-white cursor-not-allowed text-gray-500"
                                : "bg-[#EB8317] hover:bg-orange-600 transition-transform hover:shadow-none hover:-translate-x-1 hover:translate-y-1"
                            }`}
                        variant="default"
                        size="default"  >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Página anterior</span>
                    </Button>
                    <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 border border-black text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
                                ${currentPage === totalPages
                                ? "bg-white cursor-not-allowed text-gray-500"
                                : "bg-[#EB8317] hover:bg-orange-600 transition-transform hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                            }`}
                        variant="default"
                        size="default"
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Próxima página</span>
                    </Button>
                </div>
            </div>
        </div >
    );
};
