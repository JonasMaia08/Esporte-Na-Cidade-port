import React, { useState, useEffect } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { userSchema } from "../lib/schemaLoginUser";
import { Loader } from "lucide-react";
import useNavigateTo from "../hooks/useNavigateTo";
import HeaderBasic from "../components/navigation/HeaderBasic";
import { useHookFormMask } from "use-mask-input";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CustomButton from "../components/customButtom";

export const LoginProfessor: React.FC = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const GoTo = useNavigateTo();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      GoTo("/home-professor");
    }
  }, [GoTo]);

  async function onSubmit(data: FieldValues) {
    try {
      const { email, password } = data;
      // Cast para evitar erro de tipagem
      await login({ type: "teacher", email, password } as any);
      GoTo("/home-professor");
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(error.message || "Erro ao fazer login", {
        duration: 3000,
        position: "top-center",
      });
    }
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-[#F4F6FF] flex flex-col ">
        <h1 className="absolute top-7 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 text-2xl mb-10 font-jockey text-black">
          ESPORTE NA CIDADE
        </h1>
        <main className="flex flex-col items-center flex-1 mt-20">
          <div className="flex flex-col m-4 md:mx-20 p-4 md:px-24 py-7 md:py-10 w-full max-w-5xl">
            <div className="text-start px-8 mb-8">
              <h2 className="text-4xl font-bold pb-2">
                Olá, <span className="text-orange-600">Professor!</span>
              </h2>
              <p className="font-inter">Entre em sua conta para começar.</p>
            </div>

            <form
              className="bg- p-8 rounded-lg w-full"
              onSubmit={handleSubmit(onSubmit)}
            >
              <section className="mb-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="mb4">
                    <label
                      htmlFor="email"
                      className="block text-sm pb-2 font-medium text-gray-600"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Preencha com seu email"
                      {...register("email")}
                      className="w-full pl-10 pr-3 bg-[#D9D9D9] opacity-70 placeholder-black h-12 p-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-orange-600 focus:ring-opacity-40"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.email?.message as string}
                      </p>
                    )}
                  </div>
                  <div className="mb4">
                    <label
                      htmlFor="password"
                      className="block text-sm pb-2 font-medium text-gray-600"
                    >
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        id="password"
                        placeholder="Preencha com sua senha"
                        {...register("password")}
                        className="w-full pl-10 pr-10 bg-[#D9D9D9] opacity-70 placeholder-black h-12 p-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-orange-600 focus:ring-opacity-40"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-3 top-3 text-gray-600"
                      >
                        {isPasswordVisible ? (
                          <EyeIcon size={20} />
                        ) : (
                          <EyeOffIcon size={20} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.password?.message as string}
                      </p>
                    )}
                    <Link
                      to="/recuperar-senha/professor"
                      className="text-blue-600 mt-2 block"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </div>
              </section>

              <div className="py-10 flex justify-end gap-7">
                <CustomButton
                  width="w-52"
                  height="h-13"
                  variant="gray"
                  onClick={() => GoTo("/")}
                >
                  Voltar
                </CustomButton>
                <CustomButton
                  type="submit"
                  variant="orange"
                  width="w-52"
                  height="h-13"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Confirmar"
                  )}
                </CustomButton>
              </div>
            </form>
          </div>
        </main>

        <footer className="w-full text-center mb-2">
          <p className="text-sm text-gray-500">
            2024 Esporte na cidade. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
};
