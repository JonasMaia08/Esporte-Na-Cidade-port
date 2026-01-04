import api from "./api";

export const getScheduleAthlete = async (token: string) => {
  try {
    const response = await api.get("/schedule/athlete", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Erro ao buscar o horário";
    throw new Error(message);
  }
};

export const getScheduleTeacher = async (token: string) => {
  try {
    const response = await api.get("/schedule/teacher", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //console.log("Full API response structure:", response.data);
    return response.data; 
  } catch (error: any) {
    console.error("Full error object:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    throw error;
  }
};