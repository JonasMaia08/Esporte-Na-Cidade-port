import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useAuth';
import api from '../services/api';

interface Professor {
  id: number;
  name: string;
}

const FaltaProfessor: React.FC = () => {
  const user = useUser();
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;

        const response = await api.get<Professor[]>('/professors');
        setProfessors(response.data);
      } catch (error) {
        console.error('Erro ao buscar professores:', error);
        // Se falhar, usa professores padrão
        setProfessors([
          { id: 1, name: 'Professor 1' },
          { id: 2, name: 'Professor 2' },
          { id: 3, name: 'Professor 3' },
          { id: 4, name: 'Professor 4' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessors();
  }, [user?.id]);

  const handleProfessorSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedProfessors(options);
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-[#F4F6FF] p-2 rounded border border-black shadow-md">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] m-4 p-6  border border-black  flex flex-col justify-between mb-4">
      {user?.isGestor ? (
        <select
          multiple
          className="bg-white w-full p-2 rounded focus:outline-none focus:border-blue-500"
          onChange={handleProfessorSelect}
          value={selectedProfessors}
        >
          {professors.map(professor => (
            <option key={professor.id} value={professor.name}>
              {professor.name}
            </option>
          ))}
        </select>
      ) : (
        <p className="bg-white p-2 rounded">
          {selectedProfessors.length > 0
            ? selectedProfessors.join(', ')
            : 'Não há ausência de professor'}
        </p>
      )}
    </div>
  );
};

export default FaltaProfessor;