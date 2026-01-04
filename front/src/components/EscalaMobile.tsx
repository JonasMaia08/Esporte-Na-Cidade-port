import React, { useState, useEffect } from "react";
import { getModalidades } from '../services/modality';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
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

export const EscalaMobile = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const uniqueModalities = Array.from(new Set(aulas.map(a => a.modality))).filter(Boolean);
  const uniqueTeachers = Array.from(new Set(aulas.map(a => a.teacher))).filter(t => t && t !== 'Professor não especificado');

  const selectModalities = [{ value: 'all', label: 'Todas as modalidades' }, ...uniqueModalities.map(mod => ({ value: mod, label: mod }))];
  const selectTeachers = [{ value: 'all', label: 'Todos os professores' }, ...uniqueTeachers.map(teacher => ({ value: teacher, label: teacher }))];

  const filteredAulas = aulas.filter(aula => {
    const modalityMatch = !selectedModality || aula.modality === selectedModality;
    const teacherMatch = !selectedTeacher || aula.teacher === selectedTeacher;
    return modalityMatch && teacherMatch;
  });

  const aulasPorDia: { [key: string]: Aula[] } = {};
  diasSemana.forEach(dia => {
    aulasPorDia[dia] = filteredAulas.filter(aula => aula.day === dia);
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

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-4 mb-4">
        <div className="w-full">
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
        <div className="w-full">
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
        <CustomButton
          variant="orange"
          className="w-full sm:min-w-40"
          onClick={() => {
            setSelectedModality('');
            setSelectedTeacher('');
          }}
        >
          Limpar filtros
        </CustomButton>
      </div>

      <h2 className="text-lg font-semibold mb-2">Escala Semanal</h2>

      <div className="bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border min-h-10 border-black w-full">
        <div className="grid grid-cols-1 gap-2 mb-2 w-full">
          {diasSemana.map(dia => (
            <div key={dia} className="border-b-2 w-full border-black pb-2">
              <button
                onClick={() => setActiveDay(activeDay === dia ? null : dia)}
                className={`w-full text-left p-2 font-semibold transition-colors duration-200 ${activeDay === dia ? 'bg-slate-200' : 'hover:bg-gray-100'}`}
              >
                {dia}
              </button>

              <div className={`overflow-hidden w-full transition-all duration-300 ease-in-out ${activeDay === dia ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pl-4">
                  {aulasPorDia[dia].map((aula, idx) => (
                    <div key={idx} className="border-b w-full border-gray-300 last:border-0">
                      <div className="p-2 bg-white rounded">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm w-full font-medium">{aula.schedule}</p>
                          <p className="text-sm text-gray-600">{aula.modality}</p>
                          <p className="text-sm text-gray-600">{aula.teacher}</p>
                          <p className="text-sm text-gray-600">{aula.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {aulasPorDia[dia].length === 0 && (
                    <div className="p-4 bg-white rounded">
                      <p className="text-sm text-gray-600">Sem aulas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
