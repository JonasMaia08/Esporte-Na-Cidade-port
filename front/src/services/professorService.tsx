import { Professor } from "../types/Professor";
import api from "./api";

export const getProfessores = async (): Promise<Professor[]> => {
    try {
        const response = await api.get("/teacher");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar professores:", error);
        return [];
    }
};

export const saveProfessor = async (professor: Professor): Promise<Professor> => {
    try {
        const method = professor.id === -1 ? "post" : "put";
        const url = professor.id === -1 ? "/teacher" : `/teacher/${professor.id}`;

        // Cria um objeto com os dados do professor, incluindo o objeto completo da modalidade
        const professorToSave: any = { 
            ...professor,
            modality: professor.modality?.id ? { id: professor.modality.id } : null
        };

        const response = await api[method](url, professorToSave);
        return response.data;
    } catch (error) {
        console.error("Erro ao salvar professor:", error);
        throw error;
    }
};

export const getProfessorById = async (id: number): Promise<Professor> => {
    try {
        const response = await api.get(`/teacher/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar professor com ID ${id}:`, error);
        throw error;
    }
};

export const deleteProfessor = async (id: number): Promise<void> => {
    try {
        await api.delete(`/teacher/${id}`);
    } catch (error) {
        console.error(`Erro ao deletar professor com ID ${id}:`, error);
        throw error;
    }
};
