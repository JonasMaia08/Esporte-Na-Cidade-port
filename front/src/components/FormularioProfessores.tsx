import React, { forwardRef, useEffect, useState } from "react";
import { Professor } from "../types/Professor";
import { Modality } from "../types/Modality";
import { getModalities } from "../services/modalidadesService";
import Textbox from "./Textbox";
import Datepicker from "./Datepicker";
import Dropdown from "./Dropdown";
import { Button } from "./ui/button";
import PasswordRequirements from "./PasswordRequirements";
import CustomButton from "./customButtom";

interface Props {
  professorEdicao?: Professor | null; // Dados do professor sendo editado
  onSubmit: (professor: Professor) => Promise<void>; // Callback para salvar (edição ou criação)
  onCancelEdit: () => void; // Callback para cancelar edição
}

const FormularioProfessores = forwardRef<HTMLFormElement, Props>(
  ({ professorEdicao, onSubmit, onCancelEdit }, ref) => {
    const [formData, setFormData] = useState<Professor>({
      id: -1,
      name: "",
      password: "",
      cpf: "",
      rg: "",
      birthday: "",
      phone: "",
      photo_url: "",
      email: "",
      about: "",
      modality: null,
    });

    const [modalities, setModalities] = useState<Modality[]>([]);
    const [passwordError, setPasswordError] = useState<string>("");

    function isStrongPassword(password: string): boolean {
      
      return /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password);
    }

    useEffect(() => {
      if (professorEdicao) {
        setFormData(professorEdicao);
      }
      else {
        setFormData({
          id: -1,
          name: "",
          password: "",
          cpf: "",
          rg: "",
          birthday: "",
          phone: "",
          photo_url: "",
          email: "",
          about: "",
          modality: null,
        });
      }
    }, [professorEdicao]);

    useEffect(() => {
      const fetchModalities = async () => {
        const data = await getModalities();
        setModalities(data);
      };
      fetchModalities();
    }, []);

    const formatInputValue = (name: string, value: string): string => {
      let formattedValue = value;

      if (name === "cpf") {
        formattedValue = value.replace(/\D/g, "");
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
        formattedValue = value.replace(/\D/g, "");
        if (formattedValue.length <= 2) {
          return formattedValue;
        } else if (formattedValue.length <= 5) {
          formattedValue = `${formattedValue.slice(0, 2)}.${formattedValue.slice(2)}`;
        } else if (formattedValue.length <= 8) {
          formattedValue = `${formattedValue.slice(0, 2)}.${formattedValue.slice(2, 5)}.${formattedValue.slice(5)}`;
        } else {
          formattedValue = `${formattedValue.slice(0, 2)}.${formattedValue.slice(2, 5)}.${formattedValue.slice(5, 8)}-${formattedValue.slice(8, 9)}`;
        }
      } else if (name === "phone") {
        formattedValue = value.replace(/\D/g, "");
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      
      if (name === 'modality') {
        const selectedModality = modalities.find(m => m.id === Number(value)) || null;
        setFormData(prev => ({
          ...prev,
          modality: selectedModality
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: formatInputValue(name, value),
        }));
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError("");
      // Só valida se for cadastro novo ou alteração de senha
      if ((professorEdicao == null || formData.password) && !isStrongPassword(formData.password || "")) {
        setPasswordError("A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.");
        return;
      }
      try {
        await onSubmit(formData);
      } catch (error) {
        // Trate erros de submissão aqui
      }
    };


    return (
      <div>

        <form ref={ref} onSubmit={handleSubmit} className="">
          <h2 className="font-bold text-3xl mb-4 mt-20">{professorEdicao ? "Editar Professor" : "Cadastrar Professor"}</h2>
          <div className="md:flex md:flex-wrap justify-start gap-x-10 gap-y-10">
            <section className="md:w-2/5 gap-10">
              <Textbox value={formData.name} onChange={handleChange} name="name" label="Nome" iconPath="/icon/id.svg" placeholder="Insira o nome completo" type="text" required={true} />

              <Datepicker label="Data de nascimento" name="birthday" value={formData.birthday} onChange={handleChange} iconPath="/icon/date.svg" />

              <Textbox value={formData.password} onChange={handleChange} name="password" label={professorEdicao ? "Nova senha (opcional)" : "Senha"} iconPath="/icon/id.svg" placeholder={professorEdicao ? "Nova senha (caso deseje alterar)." : "Insira a senha"} type="password" required={professorEdicao === null} />
              <PasswordRequirements password={formData.password} />
              {passwordError && (
                <span className="text-red-600 text-xs mt-1 block">{passwordError}</span>
              )}

              <Textbox value={formData.phone} onChange={handleChange} name="phone" label="Telefone" iconPath="/icon/phone.svg" placeholder="(__)_____-____" type="text" required={true} />

              <label className="block text-sm font-semibold">Foto</label>
              {formData.photo_url && (
                <img
                  src={formData.photo_url}
                  alt="Pré-visualização"
                  className="mb-2 mt-2 rounded w-32 h-32 object-cover border"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="mb-2 mt-1"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formDataFile = new FormData();
                  formDataFile.append("profile", file);
                  try {
                    const response = await fetch("http://localhost:3002/api/uploads/upload", {
                      method: "POST",
                      body: formDataFile,
                    });
                    const data = await response.json();
                    if (data.profile) {
                      setFormData((prev) => ({ ...prev, photo_url: data.profile }));
                    }
                  } catch (err) {
                    alert("Erro ao fazer upload da imagem.");
                  }
                }}
              />

              <Dropdown 
                label="Modalidade" 
                name="modality" 
                onChange={handleChange} 
                value={formData.modality?.id || ""} 
                iconPath="/icon/soccer.svg"
              >
                <option value="">Selecione a modalidade</option>
                {modalities.map((modality) => (
                  <option key={modality.id} value={modality.id}>
                    {modality.name}
                  </option>
                ))}
              </Dropdown>
            </section>

            <section className="md:w-2/5">
              <Textbox value={formData.cpf} onChange={handleChange} name="cpf" label="CPF" iconPath="/icon/id.svg" placeholder="Insira o CPF" type="text" required={true} />

              <Textbox value={formData.rg} onChange={handleChange} name="rg" label="RG" iconPath="/icon/id.svg" placeholder="Insira o RG" type="text" required={true} />

              <Textbox value={formData.email} onChange={handleChange} name="email" label="E-mail do professor" iconPath="/icon/mail.svg" placeholder="Insira o e-mail" type="text" required={true} />

              <Textbox value={formData.about} onChange={handleChange} name="about" label="Sobre o professor" iconPath="/icon/id.svg" placeholder="Descreva o professor" type="text" multiline={true} required={true} />
            </section >

            <div className="w-full flex justify-between">
              <button
              type="submit"
                className="mt- self-start md:w-fit font-bold font-inter bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                {professorEdicao ? "Salvar Alterações" : "Cadastrar"}
              </button>


              {professorEdicao && (
                <button className="mt- self-start md:w-fit font-bold font-inter bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300" type="button" onClick={onCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }
);
export default FormularioProfessores;

