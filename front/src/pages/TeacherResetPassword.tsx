import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderBasic from '../components/navigation/HeaderBasic';
import PasswordRequirements from '../components/PasswordRequirements';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const TeacherResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { teacherId, token } = useParams<{ teacherId: string; token: string }>(); // Get teacherId and token from URL
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (!token || !teacherId) {
      setError('Link de redefinição inválido ou ausente de informações.');
      // Optionally redirect or disable form
    }
  }, [token, teacherId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Por favor, preencha ambos os campos de senha.');
      return;
    }

    // Validação de senha forte
    if (!(/[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password))) {
      setError('A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!token || !teacherId) {
      setError('Link de redefinição inválido. Solicite um novo link.');
      return;
    }

    try {
      await api.post(`/teacher/password-reset/${teacherId}/${token}`, { password });


      setMessage('Sua senha foi redefinida com sucesso! Você pode fazer login com sua nova senha.');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login-professor');
      }, 3000);
    } catch (err) {
      setError('Ocorreu um erro ao tentar redefinir a senha. O link pode ter expirado ou ser inválido. Tente novamente.');
      console.error('Password reset failed:', err);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F4F6FF] flex flex-col pb-16">
        <HeaderBasic logo="hide" />
        <main className="flex flex-col items-center flex-1">
          <div className="flex flex-col m-4 md:mx-20 p-4 md:px-24 py-7 md:py-12 w-full max-w-5xl">
            <div className="text-start px-8 mb-8">
              <h2 className="text-4xl font-bold pb-2">
                Redefinir <span className="text-orange-600">Senha do Professor</span>
              </h2>
              <p className="font-inter">Crie uma nova senha para acessar sua conta.</p>
            </div>
            <form
              className="bg- p-8 rounded-lg w-full"
              onSubmit={handleSubmit}
            >
              <section className="mb-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="mb4">
                    <label
                      htmlFor="password"
                      className="block text-sm pb-2 font-medium text-gray-600"
                    >
                      Nova Senha
                    </label>
                    <div>
                      <div className='relative'>

                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          id="password"
                          placeholder="Digite sua nova senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-3 bg-[#D9D9D9] opacity-70 placeholder-black h-12 p-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-orange-600 focus:ring-opacity-40"
                          required

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

                    </div>
                    <PasswordRequirements password={password} />

                  </div>
                  <div className="mb4">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm pb-2 font-medium text-gray-600"
                    >
                      Confirmar Nova Senha
                    </label>
                    <div className='relative'>

                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Confirme sua nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-3 bg-[#D9D9D9] opacity-70 placeholder-black h-12 p-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-orange-600 focus:ring-opacity-40"
                        required
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
                  </div>
                  {error && (
                    <p className="text-xs text-red-400 mt-1">{error}</p>
                  )}
                  {message && (
                    <p className="text-xs text-green-600 mt-1">{message}</p>
                  )}
                  {(!token || !teacherId) && (
                    <p className="text-xs text-orange-400 mt-1">Se você chegou aqui sem um link válido ou completo, por favor, solicite a recuperação de senha novamente.</p>
                  )}
                </div>
              </section>
              <div className="py-10 flex justify-end gap-7">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-13 md:w-52 font-bold font-inter bg-gray-200 text-gray-700 py-3 px-9 rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="h-13 md:w-52 font-bold font-inter bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
                  disabled={!token || !teacherId}
                >
                  Redefinir Senha
                </button>
              </div>
            </form>
          </div>
        </main>
        <footer className="w-full text-center mt-auto">
          <p className="text-sm text-gray-500">
            2024 Esporte na cidade. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
};

export default TeacherResetPassword;
