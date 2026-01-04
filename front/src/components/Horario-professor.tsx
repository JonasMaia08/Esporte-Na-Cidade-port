import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useAuth';
import { useDecodedToken } from '../hooks/useDecodedToken';
import api from '../services/api';
import { getScheduleTeacher } from '../services/schedule';
import dayjs from 'dayjs';

interface Modality {
  id: number;
  name: string;
  description: string;
  days_of_week: string | string[];
  start_time: string;
  end_time: string;
  start_time_minutes: string;
  end_time_minutes: string;
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
  startTimeMinutes?: number;
  day: string;
  address: string;
  modality: string;
  schedule: string;
}
const dayMap: { [key: string]: string } = {
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta',
  sab: 'Sábado',
};
 const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const AgendaProfessor: React.FC = () => {
  const user = useUser();
  const decodedToken = useDecodedToken();
  const [notes, setNotes] = useState<DayNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token não encontrado no localStorage");
          return;
        }

        const data = await getScheduleTeacher(token);

        const days = data.days?.split(",").map((day: string) => day.trim()) || [];

        const formattedNotes: DayNote[] = days.map((day: string) => ({
          day: dayMap[day] || day,
          modality: data.name,
          schedule: `${data.start_time} - ${data.end_time}`,
          address: data.class_locations?.join(", ") || "Local não especificado",
          startTimeMinutes: data.start_time_minutes || 0,
        }));

        const sortedNotes = formattedNotes.sort((a, b) => {
          if (a.day === b.day) {
            return (a.startTimeMinutes ?? 0) - (b.startTimeMinutes ?? 0);
          }
          return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
        });

        setNotes(sortedNotes);
      } catch (error: any) {
        console.error("Erro ao buscar horário:", error.response?.data || error.message);
        setNotes([
          { day: "Segunda", modality: "-", schedule: "-", address: "-" },
          { day: "Terça", modality: "-", schedule: "-", address: "-" },
          { day: "Quarta", modality: "-", schedule: "-", address: "-" },
          { day: "Quinta", modality: "-", schedule: "-", address: "-" },
          { day: "Sexta", modality: "-", schedule: "-", address: "-" },
          { day: "Sábado", modality: "-", schedule: "-", address: "-" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user?.id, decodedToken?.token]);

  if (loading) {
    return (
      <div className="bg-[#F4F6FF] p-3 pt-0 rounded border border-black w-full">
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

  const maxNotesPerDay = Math.max(
    ...daysOfWeek.map((day) => notes.filter((note) => note.day === day).length)
  );

  return (

    
    <div className="bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black p-4 w-full  mx-auto">
      <div className="grid grid-cols-6 gap-2 lg:gap-6 font-semibold mb-2 border-b-2 border-black pb-2">
        {daysOfWeek.map((day) => (
          <p key={day} className="text-start gap-1">
            {day}
          </p>
        ))}
      </div>

      {Array.from({ length: maxNotesPerDay }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-6 gap-2 lg:gap-6 py-2 border-t mb-2 border-gray-200"
        >
          {daysOfWeek.map((day) => {
            const dayNotes = notes.filter((note) => note.day === day);
            const note = dayNotes[rowIndex];

            return (
              <div key={day} className="space-y-1">
                {note ? (
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">
                      <strong>{note.modality}</strong>
                    </div>
                    <div className="text-sm text-gray-600">{note.schedule}</div>
                    <div className="text-xs text-gray-600">Local: {note.address}</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
export default AgendaProfessor;