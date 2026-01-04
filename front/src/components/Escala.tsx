import React, { useState, useEffect } from "react";
import { getModalidades } from '../services/modality';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Button } from "./ui/button";
import { EscalaMobile } from './EscalaMobile';
import CustomButton from "./customButtom";

const diasSemana = [
  'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

interface Aula {
  day: string;
  modality: string;
  schedule: string;
  location: string;
  teacher: string;
}
interface Aula {
  day: string;
  modality: string;
  schedule: string;
  location: string;
  teacher: string;
}

export const Escala = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  // Extrair listas únicas de modalidades e professores para os selects
  const uniqueModalities = Array.from(new Set(aulas.map(a => a.modality))).filter(Boolean);
  const uniqueTeachers = Array.from(new Set(aulas.map(a => a.teacher))).filter(t => t && t !== 'Professor não especificado');

  // Adicionar opção padrão para cada select
  const selectModalities = [{ value: 'all', label: 'Todas as modalidades' }, ...uniqueModalities.map(mod => ({ value: mod, label: mod }))];
  const selectTeachers = [{ value: 'all', label: 'Todos os professores' }, ...uniqueTeachers.map(teacher => ({ value: teacher, label: teacher }))];

  // Filtrar aulas baseado nos seletores
  const filteredAulas = aulas.filter(aula => {
    const modalityMatch = !selectedModality || aula.modality === selectedModality;
    const teacherMatch = !selectedTeacher || aula.teacher === selectedTeacher;
    return modalityMatch && teacherMatch;
  });

  useEffect(() => {
    const fetchModalidades = async () => {
      try {
        const dayMap: Record<string, string> = {
          'seg': 'Segunda',
          'ter': 'Terça',
          'qua': 'Quarta',
          'qui': 'Quinta',
          'sex': 'Sexta',
          'sab': 'Sábado',
          'dom': 'Domingo'
        };
        const modalidades = await getModalidades();
        const formattedAulas: Aula[] = [];
        modalidades.forEach((mod: any) => {
          //console.log('MODALIDADE:', mod);
          let days = mod.days_of_week;
          if (typeof days === 'string') {
            days = days.split(',').map((d: string) => d.trim());
          }
          (days || []).forEach((day: string) => {
            const mappedDay = dayMap[day.toLowerCase()] || day;
            if (diasSemana.includes(mappedDay)) {
              formattedAulas.push({
                day: mappedDay,
                modality: mod.name,
                schedule: mod.start_time,
                location: mod.class_locations?.[0] || '',
                teacher: mod.teachers?.[0]?.name || 'Professor não especificado'
              });
            }
          });
        });
        setAulas(formattedAulas);
      } catch (error) {
        setAulas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchModalidades();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Carregando escala...</div>;
  }

  // Agrupar aulas filtradas por dia
  const aulasPorDia: { [key: string]: Aula[] } = {};
  diasSemana.forEach(dia => {
    aulasPorDia[dia] = filteredAulas.filter(aula => aula.day === dia);
  });

  // Encontrar o maior número de aulas em qualquer dia para montar as linhas
  const maxAulasPorDia = Math.max(...diasSemana.map(dia => aulasPorDia[dia].length));

  return (
    <>
      {/* Versão desktop */}
      <div className="hidden md:block bg-[#d9d9d9] rounded-lg border border-black p-4 pb-8">
        <h2 className="text-lg font-semibold mb-1">Escala Semanal</h2>
        <div className="mr-4 md:mr-6">
          <div className="flex flex-wrap gap-4 px-4 md:px-8 xl:px-16 mb-4">
            <div className="flex-1 min-w-[180px]">
              <Select value={selectedModality || 'all'} onValueChange={(value) => setSelectedModality(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border min-h-10 border-black">
                  <SelectValue placeholder="Filtrar por modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {selectModalities.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <Select value={selectedTeacher || 'all'} onValueChange={(value) => setSelectedTeacher(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border min-h-10 border-black">
                  <SelectValue placeholder="Filtrar por professor" />
                </SelectTrigger>
                <SelectContent>
                  {selectTeachers.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[160px]">
              <CustomButton
                variant="orange"
                className="w-full"
                onClick={() => {
                  setSelectedModality('');
                  setSelectedTeacher('');
                }}
              >
                Limpar Filtros
              </CustomButton>
            </div>
          </div>
          <div className="w-full max-w-6xl mx-auto ">

            <div className=" bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] min-h-32 p-4 border min-w-52 border-black ">
              <div className="grid grid-cols-6 gap-2 lg:gap-6 font-semibold mb-2">
                {diasSemana.map(dia => (
                  <p key={dia} className="border-b-2 border-black pb-2">{dia}</p>
                ))}
              </div>
              {/* Renderiza as linhas da grade */}
              {Array.from({ length: maxAulasPorDia }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-6 gap-2 lg:gap-10 py-2 border-t border-gray-200">
                  {diasSemana.map(dia => {
                    const aula = aulasPorDia[dia][idx];
                    return (
                      <div key={dia} className="space-y-1">
                        {aula ? (
                          <div className="flex flex-col gap-1">
                            <div className="font-medium"><strong>{aula.modality}</strong></div>
                            <div className="text-sm text-gray-600">{aula.schedule}</div>
                            <div className="text-xs text-gray-600">Local: {aula.location}</div>
                            <div className="text-xs text-gray-600">Professor: {aula.teacher}</div>
                          </div>
                        ) : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Versão mobile */}
      <div className="block md:hidden bg-[#d9d9d9] p-4 border border-black w-screen max-w-sm overflow-x-hidden">
        <EscalaMobile />
      </div>

    </>
  );
};

