import api from './api';

export const inscreverEmModalidade = async (modalityId: number) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/enrollment/', { modalityId }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Get all enrollments for an athlete (optionally filtered)
export const getEnrollmentsByAthlete = async (athleteId: number, filters: any = {}) => {
  const token = localStorage.getItem('token');
  // Sempre envie athleteId, approved e active como string
  const params: any = { ...filters, athleteId: String(athleteId) };
  if (filters.approved !== undefined) params.approved = String(filters.approved);
  if (filters.active !== undefined) params.active = String(filters.active);
  const response = await api.get('/enrollment', {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Update enrollment (e.g., activate/deactivate)
export const updateEnrollmentStatus = async (enrollmentId: number, data: { approved?: boolean; active?: boolean }) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/enrollment/${enrollmentId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};