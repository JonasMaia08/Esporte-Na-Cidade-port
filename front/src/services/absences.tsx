import api from './api';

export interface Absence {
  data: string;
  modalidade: string;
  local: string;
  present: boolean;
}

export interface AbsencesResponse {
  absences: Absence[];
  modalities: { modality_id: number; modality_name: string }[];
  totalAbsences: number;
  athleteName: string;
}

export const getAthleteAbsences = async (token: string, modalityId?: number): Promise<AbsencesResponse> => {
  try {
    const params = modalityId ? { modality: modalityId } : {};

    const response = await api.get<AbsencesResponse>('/atendimentos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Erro ao buscar faltas dos atletas';
    throw new Error(message);
  }
};
