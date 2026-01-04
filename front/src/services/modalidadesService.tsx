import api from "./api";
import { Modality } from "@/types/Modality";

export const getModalities = async (): Promise<Modality[]> => {
    try {
        const response = await api.get("/modality/");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar modalidades:", error);
        return [];
    }
};