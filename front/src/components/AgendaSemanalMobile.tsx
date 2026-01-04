import React, { useState, useEffect } from "react";
import { useUser } from '../hooks/useAuth';
import api from '../services/api';

const diasSemana = [
  'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

interface DayNote {
  day: string;
  address: string;
  modality: string;
  schedule: string;
}

export const AgendaSemanalMobile: React.FC = () => {
  const user = useUser();
  const [notes, setNotes] = useState<DayNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        if (!user?.id) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await api.get('/enrollment', {
          params: { approved: true },
          headers: { Authorization: `Bearer ${token}` }
        });
        const dayMap: Record<string, string> = {
          'seg': 'Segunda',
          'ter': 'Terça',
          'qua': 'Quarta',
          'qui': 'Quinta',
          'sex': 'Sexta',
          'sab': 'Sábado',
          'dom': 'Domingo'
        };
        const formattedNotes = response.data.map((enrollment: any) => {
          const days = typeof enrollment.modality.days_of_week === 'string'
            ? enrollment.modality.days_of_week.split(',').map((d: string) => d.trim())
            : enrollment.modality.days_of_week || [];
          return days.map((day: string) => ({
            day: dayMap[day.toLowerCase()] || day,
            modality: enrollment.modality.name,
            schedule: enrollment.modality.start_time,
            address: enrollment.modality.class_locations
              ? (Array.isArray(enrollment.modality.class_locations)
                  ? enrollment.modality.class_locations[0]
                  : typeof enrollment.modality.class_locations === "string"
                    ? enrollment.modality.class_locations.split(",")[0].trim()
                    : 'Local não especificado')
              : 'Local não especificado'
          }));
        }).flat();
        setNotes(formattedNotes);
      } catch (error) {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user?.id]);

  // Monta as notas por dia
  const notesByDay: { [key: string]: DayNote[] } = {};
  diasSemana.forEach(dia => {
    notesByDay[dia] = notes.filter(note => note.day === dia);
  });

  if (loading) {
    return <div className="p-4 text-center">Carregando agenda...</div>;
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2 className="text-lg font-semibold mb-2">Agenda Semanal</h2>
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
                  {notesByDay[dia].map((note, idx) => (
                    <div key={idx} className="border-b w-full border-gray-300 last:border-0">
                      <div className="p-2 bg-white rounded">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium truncate"><strong>{note.modality}</strong></div>
                          <div className="text-sm text-gray-600 truncate">{note.schedule}</div>
                          <div className="text-xs text-gray-600 truncate">Local: {note.address}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notesByDay[dia].length === 0 && (
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
