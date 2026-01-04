import React, { useState, useEffect } from "react";
import api from "../services/api";

const AthleteAbsences = ({ modalityId }: { modalityId: number }) => {
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const response = await api.get(`/absences`);
        setAbsences(response.data);
      } catch (error) {
        console.error("Erro ao carregar as faltas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, [modalityId]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h1>Faltas dos Atletas</h1>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Total de Chamadas</th>
            <th>Faltas</th>
          </tr>
        </thead>
        <tbody >
          {absences.map((athlete) => (
            <tr key={athlete.athlete_id}>
              <td>{athlete.athlete_name}</td>
              <td>{athlete.total_calls}</td>
              <td>{athlete.absences}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AthleteAbsences;
