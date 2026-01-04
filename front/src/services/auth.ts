import api from './api';

interface LoginCredentials {
    cpf: string;
    password: string;
}

interface TeacherLoginCredentials {
    email: string;
    password: string;
}

interface ManagerLoginCredentials {
    email: string;
    password: string;
}

export const loginAthlete = async (credentials: LoginCredentials) => {
    try {
        const response = await api.post('/auth/login', {
            type: "athlete",
            credentials: {
                cpf: credentials.cpf,
                password: credentials.password
            }
        });

        if (response.data.accessToken && response.data.user) {
            return response.data;
        }
        throw new Error(response.data.message || "Erro ao fazer login");
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
};

export const loginTeacher = async (credentials: TeacherLoginCredentials) => {
    try {
        const response = await api.post('/auth/login', {
            type: "teacher",
            credentials: {
                email: credentials.email,
                password: credentials.password
            }
        });

        if (response.data.accessToken && response.data.user) {
            return response.data;
        }
        throw new Error(response.data.message || "Erro ao fazer login");
    } catch (error: any) {
        if (error.response?.status === 401) {
            throw new Error('Usuário ou senha incorretos');
        }
        throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
};

export const loginManager = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', {
      type: "manager",
      credentials: {
        email: credentials.email,
        password: credentials.password
      }
    });

    if (response.data.accessToken && response.data.user) {
      return response.data;
    }
    throw new Error(response.data.message || "Erro ao fazer login");
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Usuário ou senha incorretos');
    }
    throw new Error(error.response?.data?.message || 'Erro ao fazer login');
  }
};
export const confirmPassword = async (formData: any, type: any) => {
  try {
    const response = await api.post("/auth/confirm-password", { password: formData.password, type: type });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || "Falha na confirmação de senha");
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Senha incorreta");
    }
    throw new Error(error.response?.data?.message || "Erro ao confirmar senha");
  }
};
