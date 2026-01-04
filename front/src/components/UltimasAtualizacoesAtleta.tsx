import React, { useEffect, useState } from "react";
import api from '../services/api';
import { useUser } from '../hooks/useAuth';

interface UpdateItem {
  type: 'approved' | 'inactive';
  message: string;
  date: string;
}

const UltimasAtualizacoesAtleta: React.FC = () => {
  const user = useUser();
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      try {
        if (!user?.id) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await api.get('/enrollment', {
          params: { athleteId: user.id },
          headers: { Authorization: `Bearer ${token}` }
        });
        const items: UpdateItem[] = response.data.map((enr: any) => {
          if (enr.approved && enr.active) {
            return {
              type: 'approved',
              message: `✅ Você foi aprovado na modalidade ${enr.modality?.name || ''}.`,
              date: enr.updated_at
            };
          }
          if (!enr.active) {
            return {
              type: 'inactive',
              message: `🚨 Sua inscrição foi inativada da modalidade ${enr.modality?.name || ''}.`,
              date: enr.updated_at
            };
          }
          return null;
        }).filter(Boolean);
        // Ordena por data decrescente
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setUpdates(items as UpdateItem[]);
      } catch (err) {
        setUpdates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, [user?.id]);

  return (
    <>
      <h3 className="font-semibold text-lg mb-2">ÚLTIMAS ATUALIZAÇÕES</h3>
    <div className="bg-[#d9d9d9] p-4 rounded mb-8 max-h-[50vh] overflow-y-auto pr-2">
      {loading ? (
        <div>Carregando...</div>
      ) : updates.length === 0 ? (
        <div className="text-gray-600">Nenhuma atualização recente.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {updates.map((up, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border border-black p-4 mr-3 flex flex-col"
            >
              <span className="text-xs text-gray-500 mb-2">{new Date(up.date).toLocaleString('pt-BR')}</span>
              <span className="text-base text-gray-800">{up.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default UltimasAtualizacoesAtleta;
