import React, { useState, useEffect } from "react";
import PasswordRequirements from "../components/PasswordRequirements";
import MultipartForm from "../components/MultipartForm";
import { Athlete } from "@/types/Athlete";
import axios from "axios";
import { useFileUpload } from "../hooks/useFileConvert";
import { Navigate } from "react-router-dom";
import useNavigateTo from "../hooks/useNavigateTo";
import { useNavigate } from 'react-router-dom';
import api from "../services/api";
import { EyeIcon, EyeOffIcon } from "lucide-react";


const CadastroAtleta: React.FC = () => {
  // Função para upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profile', file);
    try {
      const response = await api.post("/uploads/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = response.data;
      if (data.profile) {
        setAthlete(prev => ({ ...prev, [field]: data.profile }));
      }
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
    }
  };



  const GoTo = useNavigateTo();
  const [athlete, setAthlete] = useState<Athlete>({
    name: "",
    cpf: "",
    rg: "",
    phone: "",
    //address: "",
    fatherName: "",
    motherName: "",
    birthday: "",
    phoneNumber: "",
    password: "",
    email: "",
    responsibleName: "",
    responsibleEmail: "",
    motherPhoneNumber: "",
    fatherPhoneNumber: "",
    bloodType: "",
    frontIdPhotoUrl: null,
    backIdPhotoUrl: null,
    athletePhotoUrl: null,
    foodAllergies: "",
    estado: "",
    cidade: "",
    bairro: "",
    rua: "",
    numeroDaCasa: "",
    complemento: "",
    referencia: "",

  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; rg?: string; phone?: string; password?: string, numeroDaCasa?: string, cep?: string, cpf?: string, cidade?: string, rua?: string, bairro?: string, referencia?: string, estado?: string, complemento?: string, }>({
    name: "",
    email: "",
    password: "",
    numeroDaCasa: "",
    cep: "",
    cpf: "",
    cidade: "",
    rua: "",
    bairro: "",
    referencia: "",
    estado: "",
    complemento: "",
    rg: "",
    phone: ""

  });


  const stepFields: any = {
    1: ['name', 'cpf', 'rg', 'phone'],              // Step 1 fields
    2: ['estado', 'cidade', 'cidade', 'bairro', 'numeroDaCasa', 'complemento', 'referencia'],           // Step 2 fields
    3: ['email', 'password',],
    4: ['birthday', 'bloodType', 'foodAllergies'],
    5: ['fatherName', 'motherName', 'fatherPhoneNumber', 'motherPhoneNumber'],
    6: ['frontIdPhotoUrl', 'backIdPhotoUrl', 'athletePhotoUrl']  // Step 3 fields

  };
  const requiredFields = ["name", "cpf", "cep", "rg", "phone", "password", 'estado', 'cidade', 'cidade', 'bairro', 'numeroDaCasa',];


  const [isValidating, setIsValidating] = useState(false);
  const [cpfValidationError, setCpfValidationError] = useState("");
  const [emailValidationError, setEmailValidationError] = useState("");
   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({
    frontIdPhotoUrl: '',
    backIdPhotoUrl: '',
    athletePhotoUrl: ''
  });
  //controlador do formulario
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = async () => {
    setIsValidating(true);
    console.log('[Form Navigation] Attempting to move to next step from:', currentStep);

    try {
      // Only validate current step's required fields
      const requiredOk = validateRequiredFields();
      if (!requiredOk) {
        console.log('[Form Navigation] Required fields validation failed');
        return;
      }

      // Step-specific validations
      if (currentStep === 1) {
        console.log('[Form Navigation] Validating CPF');
        const isCpfValid = await validateCpf(athlete.cpf);
        if (!isCpfValid) {
          console.log('[Form Navigation] CPF validation failed');
          return;
        }
      }

      if (currentStep === 3) {
        console.log('[Form Navigation] Validating email');
        const isEmailValid = await validateEmail(athlete.email);
        if (!isEmailValid) {
          console.log('[Form Navigation] Email validation failed');
          return;
        }

        console.log('[Form Navigation] Validating password');
        const isPasswordValid = await validatePassword(athlete.password);
        if (!isPasswordValid) {
          console.log('[Form Navigation] Password validation failed');
          return;
        }
      }

      console.log('[Form Navigation] All validations passed, moving to step:', currentStep + 1);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error('[Form Navigation] Error during validation:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  //formatar inputs

  const formatInputValue = (name: string, value: string): string => {
    let formattedValue = value;

    if (["cpf", "rg", "phone", "motherPhoneNumber", "fatherPhoneNumber", "CEP"].includes(name)) {
      formattedValue = value.replace(/\D/g, "");

    }

    if (name === "cpf") {
      if (formattedValue.length <= 3) {
        return formattedValue;
      } else if (formattedValue.length <= 6) {
        formattedValue = `${formattedValue.slice(0, 3)}.${formattedValue.slice(3)}`;
      } else if (formattedValue.length <= 9) {
        formattedValue = `${formattedValue.slice(0, 3)}.${formattedValue.slice(3, 6)}.${formattedValue.slice(6)}`;
      } else {
        formattedValue = `${formattedValue.slice(0, 3)}.${formattedValue.slice(3, 6)}.${formattedValue.slice(6, 9)}-${formattedValue.slice(9, 11)}`;
      }
    } else if (name === "rg") {
      if (formattedValue.length <= 2) {
        return formattedValue;
      } else if (formattedValue.length <= 5) {
        formattedValue = `${formattedValue.slice(0, 2)}.${formattedValue.slice(2)}`;
      } else if (formattedValue.length <= 8) {
        formattedValue = `${formattedValue.slice(0, 2)}.${formattedValue.slice(2, 5)}.${formattedValue.slice(5)}`;
      } else {
        formattedValue = `${formattedValue.slice(0, 2)}.${formattedValue.slice(2, 5)}.${formattedValue.slice(5, 8)}-${formattedValue.slice(8, 9)}`;
      }
    } else if (name === "phone" || name === "motherPhoneNumber" || name === "fatherPhoneNumber") {
      if (formattedValue.length <= 2) {
        formattedValue = `(${formattedValue}`;
      } else if (formattedValue.length <= 6) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2)}`;
      } else if (formattedValue.length <= 10) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7)}`;
      } else {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7, 11)}`;
      }
    }
    else if (name === "motherPhoneNumber") {
      if (formattedValue.length <= 2) {
        formattedValue = `(${formattedValue}`;
      } else if (formattedValue.length <= 6) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2)}`;
      } else if (formattedValue.length <= 10) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7)}`;
      } else {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7, 11)}`;
      }
    }
    else if (name === "fatherPhoneNumber") {
      if (formattedValue.length <= 2) {
        formattedValue = `(${formattedValue}`;
      } else if (formattedValue.length <= 6) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2)}`;
      } else if (formattedValue.length <= 10) {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7)}`;
      } else {
        formattedValue = `(${formattedValue.slice(0, 2)}) ${formattedValue.slice(2, 7)}-${formattedValue.slice(7, 11)}`;
      }
    }



    return formattedValue;
  };

  //para limpar a formatação para enviar para o banco
  const cleanInput = (value: string) => {
    return value.replace(/[^\w\s]/gi, "").replace(/\s/g, "");
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    // Upload images immediately and store URL
    if (files && files.length > 0 && (name === "athletePhotoUrl" || name === "frontIdPhotoUrl" || name === "backIdPhotoUrl")) {
      const file = files[0];
      const formData = new FormData();
      formData.append("profile", file);
      try {
        const response = await api.post("/uploads/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.data
        if (data.profile) {
          setAthlete((prevState) => ({
            ...prevState,
            [name]: data.profile,
          }));
        }
      } catch (err) {
        console.error("Erro ao fazer upload da imagem.", err);
      }
    } else {
      const rawValue = value.replace(/\D/g, ""); // só números
      const formattedValue = formatInputValue(name, value);
      setAthlete((prevState) => ({ ...prevState, [name]: formattedValue }));
    }

    if (name === "cpf") {
      const cleanedCpf = value.replace(/\D/g, "");
      if (cleanedCpf.length === 11) {
        await validateCpf(value);
      } else {
        setCpfValidationError(cleanedCpf.length > 0 ? "CPF deve ter 11 dígitos" : "");
      }
    }


    //validação de cep
    if (name === "CEP" && /^\d{8}$/.test(value)) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();

        if (data.erro) {
          console.error("CEP inválido.");
          setErrors((prev) => ({ ...prev, cep: "CEP inválido" }));
          return;
        }
        setErrors((prev) => ({ ...prev, cep: "" }));

        setAthlete((prevState) => ({
          ...prevState,
          estado: data.uf || "",
          cidade: data.localidade || "",
          bairro: data.bairro || "",
          rua: data.logradouro || "",
        }));
      } catch (error) {
        setErrors((prev) => ({ ...prev, cep: "Erro ao buscar o CEP" }));
        console.error("Erro ao buscar endereço:", error);
      }
    }
  };

  //validação de cpf
  const validateCpf = async (cpf: string): Promise<boolean> => {
    const cleanedCpf = cpf.replace(/\D/g, "");

    // Client-side validation first
    if (cleanedCpf.length !== 11) {
      setCpfValidationError("CPF deve ter 11 dígitos");
      return false;
    }

    // Check for obvious invalid patterns (all same digits)
    if (/^(\d)\1{10}$/.test(cleanedCpf)) {
      setCpfValidationError("CPF inválido");
      return false;
    }

    try {
      const response = await api.post("/validation/cpf", {
        cpf: cleanedCpf
      });

      if (response.data.valid) {
        setCpfValidationError("");
        return true;
      } else {
        setCpfValidationError(response.data.message);
        return false;
      }

    } catch (error) {
      // Handle network errors differently from validation errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          setCpfValidationError(error.response.data.message || "Erro na validação");
        } else {
          // Network error
          setCpfValidationError("Erro de conexão. Verifique sua internet.");
        }
      } else {
        setCpfValidationError("Erro desconhecido ao validar CPF");
      }
      return false;
    }
  };

  const validateEmail = async (email: string): Promise<boolean> => {
    console.log('[Email Validation] Starting validation for:', email);

    if (!email) {
      return true
    }
    // Basic regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[Email Validation] Failed regex validation');
      setEmailValidationError("Formato de email inválido");
      return false;
    }

    try {
      console.log('[Email Validation] Making API validation request');
      const response = await api.post("/validation/email", { email });
      console.log('[Email Validation] API response:', response.data);

      if (response.data.valid) {
        console.log('[Email Validation] Email is valid');
        setEmailValidationError("");
        return true;
      } else {
        console.log('[Email Validation] Email is invalid:', response.data.message);
        setEmailValidationError(response.data.message || "Email inválido");
        return false;
      }

    } catch (error) {
      console.error('[Email Validation] Error during validation:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('[Email Validation] Server responded with error:', error.response.data);
          setEmailValidationError(error.response.data.message || "Erro na validação do email");
        } else {
          console.error('[Email Validation] Network error:', error.message);
          setEmailValidationError("Erro de conexão. Verifique sua internet.");
        }
      } else {
        console.error('[Email Validation] Unknown error:', error);
        setEmailValidationError("Erro desconhecido ao validar email");
      }
      return false;
    }
  };

  const validatePassword = async (password: string): Promise<boolean> => {
    console.log('[Password Validation] Starting validation for:', password);

    if (!password) {
      setErrors((prev) => ({
        ...prev,
        password: "A senha não pode estar vazia",
      }));
      return false;
    }

    if (password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: "A senha deve ter pelo menos 6 caracteres",
      }));
      return false;
    }

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      setErrors((prev) => ({
        ...prev,
        password: "A senha deve conter letras e números",
      }));
      return false;
    }

    try {
      console.log('[Password Validation] Making API validation request');
      const response = await api.post("/validation/password", { password });
      console.log('[Password Validation] API response:', response.data);

      if (response.data.valid) {
        setErrors((prev) => ({ ...prev, password: "" }));
        return true;
      } else {
        setErrors((prev) => ({
          ...prev,
          password: response.data.message || "Senha inválida",
        }));
        return false;
      }

    } catch (error: unknown) {
      console.error("[Password Validation] Error during validation:", error);

      return false;
    }
  };


  const validateRequiredFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Get fields required for CURRENT step only
    const currentStepFields = stepFields[currentStep] || [];

    // Only validate fields for this step
    currentStepFields.forEach((field: any) => {
      if (requiredFields.includes(field)) { // Only check if field is required
        const value = athlete[field as keyof Athlete]?.toString();
        if (!value || !value.trim()) {
          newErrors[field] = "Campo obrigatório";
        }
      }
    });

    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const navigate = useNavigate();
  const handleSubmit = async () => {
    //const frontBase64 = await convertFile(athlete.frontIdPhotoUrl);
    //const backBase64 = await convertFile(athlete.backIdPhotoUrl);
    //const photoBase64 = await convertFile(athlete.athletePhotoUrl);

    const cleanedAthlete = {
      ...athlete,
      cpf: athlete.cpf.replace(/\D/g, ""),
      rg: athlete.rg.replace(/\D/g, ""),
      phone: athlete.phone.replace(/\D/g, ""),
      fatherPhoneNumber: athlete.fatherPhoneNumber?.replace(/\D/g, ""),
      motherPhoneNumber: athlete.motherPhoneNumber?.replace(/\D/g, ""),
      phoneNumber: athlete.phoneNumber?.replace(/\D/g, ""),
      // Guarantee only URLs are sent
      athletePhotoUrl: typeof athlete.athletePhotoUrl === 'string' ? athlete.athletePhotoUrl : null,
      frontIdPhotoUrl: typeof athlete.frontIdPhotoUrl === 'string' ? athlete.frontIdPhotoUrl : null,
      backIdPhotoUrl: typeof athlete.backIdPhotoUrl === 'string' ? athlete.backIdPhotoUrl : null,
    };


    console.log("Athlete Data (clean):", cleanedAthlete);

    try {
      const response = await api.post("/register", cleanedAthlete, {
        headers: { "Content-Type": "application/json" },
      });
      navigate("/redirecting", { replace: true });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
    }
  };

  const steps = [
    {
      step: 1,
      title: "Dados Pessoais",
      content: (
        <div>
          <h2 className="text-xl font-semibold mb-6">Dados Pessoais</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Nome</label>
            <input
              type="text"
              name="name"
              value={athlete.name}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Insira seu nome completo"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">CPF</label>
            <input
              type="text"
              name="cpf"
              value={athlete.cpf}
              onChange={handleChange}
              onBlur={() => validateCpf(athlete.cpf)}
              className={`shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border rounded-sm ${cpfValidationError ? "border-red-500" : "border-black"
                }`}
              placeholder="Insira seu CPF"
              disabled={isValidating}
            />
            {errors.cep && <p className="text-red-500 text-sm">{errors.cep}</p>}
            {cpfValidationError && (
              <p className="text-red-500 text-sm mt-1">{cpfValidationError}</p>
            )}
            {isValidating && (
              <p className="text-blue-500 text-sm mt-1">Validando CPF...</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">RG</label>
            <input
              type="text"
              name="rg"
              value={athlete.rg}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Insira seu RG"
            />
            {errors.rg && <p className="text-red-500 text-sm">{errors.rg}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Telefone</label>
            <input
              type="text"
              name="phone"
              value={athlete.phone}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="(XX) XXXXX-XXXX"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
        </div>
      ),
    },
    //============================Endereço======================= 
    {
      step: 2,
      title: "Endereço",
      content: (
        <div>
          <h2 className="text-xl font-semibold mb-4">Endereço</h2>
          <div className="mb-4 relative">
            <label className="font-semibold block text-sm">CEP</label>
            <div className="relative">
              <input
                type="text"
                name="CEP"
                maxLength={8}
                onChange={handleChange}
                className={`shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border ${errors.cep ? "border-red-500" : "border-black"
                  } rounded-sm pr-10`}
                placeholder="Insira seu CEP"
              />
              {errors.cep && <p className="text-red-500 text-sm">{errors.cep}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="font-semibold block text-sm">Estado</label>
            <input
              type="estado"
              name="estado"
              value={athlete.estado}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Cidade"
            />
            {errors.estado && <p className="text-red-500 text-sm">{errors.estado}</p>}
          </div>

          <div className="mb-4">
            <label className="font-semibold block text-sm">Cidade</label>
            <input
              type="cidade"
              name="cidade"
              value={athlete.cidade}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Cidade"
            />
            {errors.cidade && <p className="text-red-500 text-sm">{errors.cidade}</p>}
          </div>

          <div className="mb-4">
            <label className="font-semibold block text-sm">Bairro</label>
            <input
              type="bairro"
              name="bairro"
              value={athlete.bairro}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Bairro"
            />
            {errors.bairro && <p className="text-red-500 text-sm">{errors.bairro}</p>}
          </div>

          <div className="mb-4">
            <label className="font-semibold block text-sm">Rua</label>
            <input
              type="rua"
              name="rua"
              value={athlete.rua}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Rua"
            />
            {errors.rua && <p className="text-red-500 text-sm">{errors.rua}</p>}
          </div>

          <div className="mb-4">
            <label className="font-semibold block text-sm">Numero Da Casa</label>
            <input
              type="numeroDaCasa"
              name="numeroDaCasa"
              value={athlete.numeroDaCasa}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Numero Da Casa"
            />
            {errors.numeroDaCasa && <p className="text-red-500 text-sm">{errors.numeroDaCasa}</p>}
          </div>


          <div className="mb-4">
            <label className="font-semibold block text-sm">Complemento (opcional)</label>
            <input
              type="complemento"
              name="complemento"
              value={athlete.complemento}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Complemento"
            />
            {errors.complemento && <p className="text-red-500 text-sm">{errors.complemento}</p>}
          </div>

          <div className="mb-4">
            <label className="font-semibold block text-sm">Referência (opcional)</label>
            <input
              type="referencia"
              name="referencia"
              value={athlete.referencia}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Referência"
            />
            {errors.referencia && <p className="text-red-500 text-sm">{errors.referencia}</p>}
          </div>

        </div>
      ),
    },
    {
      step: 3,
      title: "Credenciais",
      content: (
        <div>
          <h2 className="text-xl font-semibold mb-4">Credenciais</h2>
          <div className="mb-4">
            <label className="font-semibold block text-sm">Email (opcional)</label>
            <input
              type="email"
              name="email"
              value={athlete.email}
              onChange={handleChange}
              onBlur={() => validateEmail(athlete.email)}
              className={`px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border rounded-sm ${emailValidationError ? "border-red-500" : "border-black"}`}
              placeholder="Insira seu e-mail"
              disabled={isValidating}
            />
            {emailValidationError && (
              <p className="text-red-600 text-sm mt-1">{emailValidationError}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="font-semibold block text-sm">Senha</label>

            <div>
              <div className='relative'>

                <input
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Crie uma senha"
                  value={athlete.password}
                  onChange={handleChange}
                  className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
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





            <PasswordRequirements password={athlete.password} />
            {/* {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>} */}
          </div>
        </div>
      ),
    },
    {
      step: 4,
      title: "Informações Adicionais",
      content: (
        <div>
          <h2 className="text-xl font-semibold mb-4">Informações Médicas</h2>
          <div className="mb-4">
            <label className="font-semibold block text-sm">Data de Nascimento (opcional)</label>
            <input
              type="date"
              name="birthday"
              value={athlete.birthday}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Insira sua data de nascimento"
            />
          </div>
          <div>
            <label className="font-semibold block text-sm text-gray-700">
              Tipo Sanguíneo (opcional)
            </label>
            <select
              name="bloodType"
              value={athlete.bloodType}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
            >
              <option value="">Selecione...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <br />
          <div className="mb-4">
            <label className="font-semibold block text-sm">Alergias Alimentares (opcional)</label>
            <input
              type="text"
              name="foodAllergies"
              value={athlete.foodAllergies}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Informe suas alergias alimentares"
            />
          </div>
        </div>
      ),
    },
    {
      step: 5,
      title: "Informações Familiares",
      content: (
        <div>
          <h2 className="text-xl font-semibold mb-4">Informações Familiares</h2>
          <div className="mb-4">
            <label className="font-semibold block text-sm">Nome do Pai (opcional)</label>
            <input
              type="text"
              name="fatherName"
              value={athlete.fatherName}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Nome completo do pai"
            />
          </div>
          <div className="mb-4">
            <label className="font-semibold block text-sm">Nome da Mãe (opcional)</label>
            <input
              type="text"
              name="motherName"
              value={athlete.motherName}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="Nome completo da mãe"
            />
          </div>
          <div className="mb-4">
            <label className="font-semibold block text-sm">Telefone da Mãe (opcional)</label>
            <input
              type="text"
              name="motherPhoneNumber"
              value={athlete.motherPhoneNumber}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>
          <div className="mb-4">
            <label className="font-semibold block text-sm">Telefone do Pai (opcional)</label>
            <input
              type="text"
              name="fatherPhoneNumber"
              value={athlete.fatherPhoneNumber}
              onChange={handleChange}
              className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>
        </div>
      ),
    },
    {
      step: 6,
      title: "Fotos",
      content: (
        <div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Fotos</h2>
            <div className="mb-4">
              <label className="font-semibold block text-sm">Foto de Frente do RG</label>
              <input
                type="file"
                name="frontIdPhotoUrl"
                onChange={e => handleImageUpload(e, 'frontIdPhotoUrl')}
                className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold block text-sm">Foto de Verso do RG</label>
              <input
                type="file"
                name="backIdPhotoUrl"
                onChange={e => handleImageUpload(e, 'backIdPhotoUrl')}
                className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold block text-sm">Foto do Atleta</label>
              <input
                type="file"
                name="athletePhotoUrl"
                onChange={e => handleImageUpload(e, 'athletePhotoUrl')}
                className="shadow-sm shadow-slate-500 px-4 py-3 bg-[#d9d9d9] mt-1 block w-full border border-black rounded-sm"
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return <>
    <div className="mb-6 mt-6">
      <h1 className="w-full m-auto text-center">
        <span className="font-jockey text-xl mr-2">ESPORTE NA CIDADE</span>
      </h1>
    </div>
    <MultipartForm
      steps={steps}
      onSubmit={handleSubmit}
      onNext={handleNext}
      onPrevious={handlePrevious}
      currentStep={currentStep}
    />
  </>;
};

export default CadastroAtleta;
