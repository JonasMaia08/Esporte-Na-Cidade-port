import React, { useState, useEffect } from "react";
import useNavigateTo from "../hooks/useNavigateTo";
import { CalendarDays } from 'lucide-react';
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, } from 'lucide-react'
import { useUser } from '../hooks/useAuth';
import api from '../services/api';

interface Compromisso {
  id: number;
  data: string;
  descricao: string;
}

const CalendarioCompromissos: React.FC = () => {
  const user = useUser();
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompromissos = async () => {
      try {
        setLoading(true);
        if (!user?.id || !user?.isGestor) return;

        const response = await api.get(`/compromissos/${user.id}`);
        setCompromissos(response.data);
      } catch (error) {
        console.error('Erro ao buscar compromissos:', error);
        // Se falhar, usa os dados do localStorage como fallback
        const savedCompromissos = localStorage.getItem("compromissos");
        if (savedCompromissos) {
          setCompromissos(JSON.parse(savedCompromissos));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompromissos();
  }, [user?.id, user?.isGestor]);

  useEffect(() => {
    localStorage.setItem("compromissos", JSON.stringify(compromissos));
  }, [compromissos]);

  const handleAddOrEditCompromisso = async () => {
    try {
      if (editId !== null) {
        const updatedCompromissos = compromissos.map(comp => 
          comp.id === editId ? { id: editId, data, descricao } : comp
        );
        await api.put(`/compromissos/${editId}`, { data, descricao });
        setCompromissos(updatedCompromissos);
        setEditId(null);
      } else {
        const newCompromisso = { id: Date.now(), data, descricao };
        await api.post('/compromissos', { ...newCompromisso, userId: user?.id });
        setCompromissos([...compromissos, newCompromisso]);
      }
      setData("");
      setDescricao("");
    } catch (error) {
      console.error('Erro ao salvar compromisso:', error);
    }
  };

  const handleEdit = (id: number) => {
    const compromisso = compromissos.find(comp => comp.id === id);
    if (compromisso) {
      setData(compromisso.data);
      setDescricao(compromisso.descricao);
      setEditId(id);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/compromissos/${id}`);
      setCompromissos(compromissos.filter(comp => comp.id !== id));
    } catch (error) {
      console.error('Erro ao excluir compromisso:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#d9d9d9] p-2 rounded shadow-md border border-black">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-1">Calendário compromissos</h2>

      <div className="bg-[#d9d9d9] p-2 rounded shadow-md border border-black">
        {user?.isGestor && (
          <div className="mb-4">
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="border p-2 mr-2 rounded"
            />
            <input
              type="text"
              placeholder="Descrição do compromisso"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="border p-2 mr-2 rounded"
            />
            <button
              onClick={handleAddOrEditCompromisso}
              className="bg-orange-600 text-white p-2 rounded"
            >
              {editId ? "Editar Compromisso" : "Adicionar Compromisso"}
            </button>
          </div>
        )}
        <ul className="space-y-2">
          {compromissos.map((comp) => (
            <li key={comp.id} className="bg-white p-2 rounded-md flex justify-between items-center">
              <div>
                <span className="font-semibold block">{comp.data}</span>
                <span className="block">{comp.descricao}</span>
              </div>
              {user?.isGestor && (
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(comp.id)} className="text-blue-500">Editar</button>
                  <button onClick={() => handleDelete(comp.id)} className="text-red-500">Excluir</button>
                </div>
              )}
            </li>
          ))}
          {compromissos.length === 0 && <p>Nenhum compromisso adicionado</p>}
        </ul>
      </div>
    </>
  );
};

export default CalendarioCompromissos;