export interface User {
    id: number;
    name?: string; // Agora opcional
    cpf: string;
    role: string; 
    email?: string;
    phone?: string;
    birthday?: string;
    rg?: string;
    password?: string;
    photo_url?: string;
    profilePicture?: string;
    isAtleta?: boolean;
    isProfessor?: boolean;
    isGestor?: boolean;
    [key: string]: any; // Permite propriedades adicionais
}

export type LoginCredentials = 
  | { type: 'athlete'; cpf: string; password: string }
  | { type: 'teacher'; email: string; password: string }
  | { type: 'manager'; email: string; password: string };

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    fetchUser: () => Promise<void>;
    updateUser: (updatedFields: Partial<User>) => void;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        accessToken: string;
        athlete?: User;
        teacher?: User;
        manager?: User;
    };
}
