import React, { forwardRef, useEffect, useState } from "react";
import { Manager } from "@/types/Manager";
import Textbox from "./Textbox";
import Datepicker from "./Datepicker";
import { Button } from "./ui/button";
import PasswordRequirements from "./PasswordRequirements";

interface Props {
  managerEdicao: Manager | null;
  onSubmit: (manager: Manager) => void;
  onCancelEdit: () => void;
}

const emptyForm = {
  name: "",
  cpf: "",
  rg: "",
  birthday: "",
  phone: "",
  photo_url: "",
  email: "",
  password: "",
};


const FormularioManagers = forwardRef<HTMLFormElement, Props>(
  ({ managerEdicao, onSubmit, onCancelEdit }, ref) => {
    const [form, setForm] = useState<Manager>({
      name: "",
      cpf: "",
      rg: "",
      birthday: "",
      phone: "",
      photo_url: "",
      email: "",
      password: "",
    });
    const [uploading, setUploading] = useState(false);
    const [passwordError, setPasswordError] = useState<string>("");

    function isStrongPassword(password: string): boolean {
      return /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password);
    }



    function maskCpf(cpf: string) {
      let v = cpf.replace(/\D/g, "");
      if (v.length <= 3) return v;
      if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
      if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
      return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9, 11)}`;
    }
    function maskRg(rg: string) {
      let v = rg.replace(/\D/g, "");
      if (v.length <= 2) return v;
      if (v.length <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`;
      if (v.length <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
      return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}-${v.slice(8, 9)}`;
    }
    function maskPhone(phone: string) {
      let v = phone.replace(/\D/g, "");
      if (v.length <= 2) return `(${v}`;
      if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
      if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
    }

    useEffect(() => {
      if (managerEdicao) {
        setForm({
          ...managerEdicao,
          cpf: maskCpf(managerEdicao.cpf || ""),
          rg: maskRg(managerEdicao.rg || ""),
          phone: maskPhone(managerEdicao.phone || ""),
          password: ""
        });
      } else {
        setForm({
          name: "",
          cpf: "",
          rg: "",
          birthday: "",
          phone: "",
          photo_url: "",
          email: "",
          password: "",
        });
      }
    }, [managerEdicao]);

    function formatInputValue(name: string, value: string): string {
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
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: formatInputValue(name, value) }));
    }


    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const formDataFile = new FormData();
      formDataFile.append("profile", file);
      try {
        const response = await fetch("http://localhost:3002/api/uploads/upload", {
          method: "POST",
          body: formDataFile,
        });
        const data = await response.json();
        if (data.profile) {
          setForm((prev) => ({ ...prev, photo_url: data.profile }));
        }
      } catch (err) {
        alert("Erro ao fazer upload da imagem.");
      } finally {
        setUploading(false);
      }
    }

    // Calcula a data máxima permitida para nascimento (18 anos atrás)
    function getMaxBirthday() {
      const today = new Date();
      today.setFullYear(today.getFullYear() - 18);
      return today.toISOString().split('T')[0];
    }

    function isOver18(dateString: string) {
      if (!dateString) return false;
      const birthday = new Date(dateString);
      const today = new Date();
      today.setFullYear(today.getFullYear() - 18);
      return birthday <= today;
    }

    function formatDateBR(dateString: string) {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const maxDate = getMaxBirthday();
      setPasswordError("");
      if (!isOver18(form.birthday)) {
        alert(`O gestor deve ter pelo menos 18 anos (data de nascimento até ${formatDateBR(maxDate)}).`);
        return;
      }
      // Só valida se for cadastro novo ou alteração de senha
      if ((managerEdicao === null || form.password) && !isStrongPassword(form.password || "")) {
        setPasswordError("A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.");
        return;
      }
      onSubmit(form);
    }

    function handleCancel() {
      setForm(emptyForm);
      setPasswordError("");
      onCancelEdit(); 
       // sai do modo de edição
      
    }

    return (
      <div>
        <form
          ref={ref}
          className=""
          onSubmit={handleSubmit}
        >
          <h2 className="font-bold text-3xl mb-4">
            {managerEdicao ? "Editar Gestor" : "Cadastrar Gestor"}
          </h2>

          <div className="md:flex md:flex-wrap justify-start gap-x-10 gap-y-10">
            <div className="md:w-2/5 gap-10">
              <Textbox value={form.name || ""} onChange={handleChange} name="name" label="Nome" iconPath="/icon/id.svg" placeholder="Insira o nome completo" type="text" required={true} />
              <Datepicker label="Data de nascimento" name="birthday" value={form.birthday || ""} onChange={handleChange} iconPath="/icon/date.svg" max={getMaxBirthday()} />
              <Textbox value={form.password || ""} onChange={handleChange} name="password" label={managerEdicao ? "Nova senha (opcional)" : "Senha"} iconPath="/icon/id.svg" placeholder={managerEdicao ? "Nova senha (caso deseje alterar)." : "Insira a senha"} type="password" required={managerEdicao === null} />
              <PasswordRequirements password={form.password || ""} />
              {passwordError && (
                <span className="text-red-600 text-xs mt-1 block">{passwordError}</span>
              )}
              <Textbox value={form.phone || ""} onChange={handleChange} name="phone" label="Telefone" iconPath="/icon/phone.svg" placeholder="(__)_____-____" type="text" required={true} />
              <label className="block text-sm font-semibold">Foto</label>
              {form.photo_url && (
                <img
                  src={form.photo_url}
                  alt="Pré-visualização"
                  style={{ width: 96, height: 96, objectFit: 'cover', border: '2px solid #e5e7eb', marginBottom: 8 }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="mb-2 mt-1"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />


            </div>
            <div className="md:w-2/5">
              <Textbox value={form.cpf || ""} onChange={handleChange} name="cpf" label="CPF" iconPath="/icon/id.svg" placeholder="Insira o CPF" type="text" required={true} />
              <Textbox value={form.rg || ""} onChange={handleChange} name="rg" label="RG" iconPath="/icon/id.svg" placeholder="Insira o RG" type="text" required={true} />
              <Textbox value={form.email || ""} onChange={handleChange} name="email" label="E-mail do Gestor" iconPath="/icon/mail.svg" placeholder="Insira o e-mail" type="text" required={true} />
            </div>
          </div>
          <div className="w-full flex justify-between">
            <button className="mt- self-start md:w-fit font-bold font-inter bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300" type="submit">
              {managerEdicao ? "Salvar Alterações" : "Cadastrar"}
            </button>
            {managerEdicao && (

              <button type="button"  onClick={handleCancel}className="mt- self-start md:w-fit font-bold font-inter bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300">Cancelar</button>
            )}
          </div>
        </form>
      </div>
    );
  }
);

export default FormularioManagers;

