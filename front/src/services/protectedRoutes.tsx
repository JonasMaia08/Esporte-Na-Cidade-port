import api from './api';

export const checkProtectedRoute = async () => {
  try {
    const response = await api.get('/protect/');
    console.log('Acesso autorizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao acessar rota protegida:', error.response?.data || error.message);
    throw error;
  }
};