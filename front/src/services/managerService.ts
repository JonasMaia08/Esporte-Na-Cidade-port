import api from "./api";
import { Manager } from "@/types/Manager";

export async function getManagers(): Promise<Manager[]> {
  const response = await api.get("/manager/");
  return response.data;
}

export async function saveManager(manager: Manager): Promise<Manager> {
  if (manager.id) {
    const response = await api.put(`/manager/${manager.id}`, manager);
    return response.data;
  } else {
    const response = await api.post("/manager/", manager);
    return response.data;
  }
}

export async function deleteManager(id: number): Promise<void> {
  await api.delete(`/manager/${id}`);
}

export async function graphData() {
  try {
    const response = await api.get("/manager/relatorio-graficos");
    return response.data; 
  } catch (error) {
    console.error("Error fetching graph data:", error);
    throw error; 
  }
}
