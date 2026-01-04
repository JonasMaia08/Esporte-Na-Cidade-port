import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useAuth';
import { useDecodedToken } from '../hooks/useDecodedToken';
import api from '../services/api';
import { AgendaSemanalMobile } from './AgendaSemanalMobile';

interface Modality {
  id: number;
  name: string;
  description: string;
  days_of_week: string | string[];
  start_time: string;
  end_time: string;
  class_locations: string;
}

interface Enrollment {
  id: number;
  athlete: any;
  modality: Modality;
  active: boolean;
  approved: boolean;
}

interface DayNote {
  day: string;
  address: string;
  modality: string;
  schedule: string;
}

const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const AgendaSemanal: React.FC = () => {
  const user = useUser();
  const decodedToken = useDecodedToken();
  const [notes, setNotes] = useState<DayNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;

        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token não encontrado no localStorage');
          return;
        }

        try {
          const response = await api.get<Enrollment[]>('/enrollment', {
            params: {
              approved: true,
              active: true
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
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

          const formattedNotes = response.data.map((enrollment: Enrollment) => {
            const days = typeof enrollment.modality.days_of_week === 'string'
              ? enrollment.modality.days_of_week.split(',').map(day => day.trim())
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
        } catch (error: any) {
          console.error('Erro ao buscar horário:', error.response?.data || error.message);
          setNotes([
            { day: 'Segunda', modality: "Atletismo", schedule: "18h", address: 'Centro polo esportivo' },
            { day: 'Terça', modality: "Atletismo", schedule: "18h", address: 'Centro polo esportivo' },
            { day: 'Quarta', modality: "Atletismo", schedule: "18h", address: 'Centro polo esportivo' },
            { day: 'Quinta', modality: "Judo", schedule: "18h", address: 'Rua Alencar Correa de Carvalho, 70' },
            { day: 'Sexta', modality: "Judo", schedule: "18h", address: 'Rua Alencar Correa de Carvalho, 70,' },
            { day: 'Sábado', modality: "Atletismo", schedule: "9h", address: 'Campo do Migule Vieira' },
          ]);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao buscar horário:', error);
        setNotes([
          { day: 'Segunda', modality: "Atletismo", schedule: "18h", address: 'Centro polo esportivo' },
          { day: 'Terça', modality: "Atletismo", schedule: "18h", address: 'Centro polo esportivo' },
          { day: 'Quarta', modality: "Atletismo", schedule: "18h", address: 'Centro polo esportivo' },
          { day: 'Quinta', modality: "Judo", schedule: "18h", address: 'Rua Alencar Correa de Carvalho, 70' },
          { day: 'Sexta', modality: "Judo", schedule: "18h", address: 'Rua Alencar Correa de Carvalho, 70,' },
          { day: 'Sábado', modality: "Atletismo", schedule: "9h", address: 'Campo do Migule Vieira' },
        ]);
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user?.id, decodedToken?.token]);

  if (loading) {
    return (
      <div className="bg-[#F4F6FF] p-3 pt-0 rounded border border-black">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 sm:gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-[#F4F6FF] p-2 rounded text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
              </div>
            </div>
          ))}

        </div>
      </div>
    );
  }

  // Calcula o máximo de notas em um dia para criar linhas iguais
  const maxNotesPerDay = Math.max(...daysOfWeek.map(day =>
    notes.filter(note => note.day === day).length
  ));

  return (
    <>
    <div className="hidden md:block bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black p-2 sm:p-4 w-full max-w-6xl mx-auto overflow-x-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 sm:gap-2 lg:gap-6 font-semibold mb-2 border-b-2 border-black pb-2">
        {daysOfWeek.map(day => (
          <p key={day} className="text-start gap-1 truncate">{day}</p>
        ))}
      </div>
      {Array.from({ length: maxNotesPerDay }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 sm:gap-2 lg:gap-6 py-2 border-t mb-2 border-gray-200">
          {daysOfWeek.map(day => {
            const dayNotes = notes.filter(note => note.day === day);
            const note = dayNotes[rowIndex];
            return (
              <div key={day} className="space-y-1 min-w-0">
                {note ? (
                  <div className="flex flex-col gap-1">
                    <div className="font-medium truncate"><strong>{note.modality}</strong></div>
                    <div className="text-sm text-gray-600 truncate">{note.schedule}</div>
                    <div className="text-xs text-gray-600 truncate">Local: {note.address}</div>
                  </div>
                ) : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
    <div className='block md:hidden'>

    <AgendaSemanalMobile />
    </div>
    </>
  );
};

export default AgendaSemanal;
