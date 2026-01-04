import { useContext, useEffect } from "react";
import AuthContext from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthStatus = (requiredRole?: string) => {
  const { isAuthenticated, loading, user, fetchUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      try {
        const token = localStorage.getItem("token");

        // Se não há token, não faz nada (permite acessar tela de login)
        if (!token) return;

        // Se temos token mas não temos user, busca o user
        if (!user) {
          await fetchUser();
          return;
        }

        // Se exigir role específica e não corresponder, redireciona
        if (requiredRole && user.role !== requiredRole) {
          throw new Error(`Acesso não autorizado para role ${user.role}`);
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    };

    checkAuth();
  }, [loading, user, requiredRole, navigate]);

  return {
    isAuthenticated,
    isLoading: loading,
    user,
  };
};
