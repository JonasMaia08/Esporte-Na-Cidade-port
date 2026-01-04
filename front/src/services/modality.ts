import api from './api';

export const getModalidades = async () => {
  const response = await api.get('/modality/');
  return response.data;
};

export const getModalidadesInscritas = async (athleteId: number) => {
  const token = localStorage.getItem('token');
  const response = await api.get('/enrollment/', {
    
    headers: {
      Authorization: `Bearer ${token}`
    }
    
  });
  
  return response.data;
};

export const getAtendiments = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/modality/teacher/${id}/atendiments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};