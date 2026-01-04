import React, { useEffect, useState } from "react";
import PasswordRequirements from "./PasswordRequirements";
import styles from "./SliderSwitch.module.css";
import { Athlete } from "../types/Athlete";
import { getEnrollmentsByAthlete, updateEnrollmentStatus, inscreverEmModalidade } from '../services/enrollment';
import { getAllModalities } from '../services/modalityService';
import { Modality } from '../types/Modality';
import { Enrollment } from '../types/Enrollment';

interface FormularioAtletasProps {
  athlete?: Athlete | null;
  onSubmit: (athlete: Athlete) => void;
  onCancel: () => void;
}

const emptyForm = {
  name: "", cpf: "", rg: "", birthday: "", phone: "",
  email: "", password: "", bloodType: "", foodAllergies: "",
  fatherName: "", motherName: "", fatherPhoneNumber: "", motherPhoneNumber: "",
  estado: "", cidade: "", bairro: "", rua: "", numeroDaCasa: "",
  complemento: "", referencia: "", cep: "",
  frontIdPhotoUrl: "", backIdPhotoUrl: "", athletePhotoUrl: ""
};

const FormularioAtletas: React.FC<FormularioAtletasProps> = ({ athlete, onSubmit, onCancel }) => {
  const [showModalitiesManager, setShowModalitiesManager] = useState(false);
  const [allModalities, setAllModalities] = useState<Modality[]>([]);
  const [enrollmentStates, setEnrollmentStates] = useState<Record<number, {enrollment: Enrollment|null, loading: boolean, error: string|null}>>({});
  const [form, setForm] = useState<any>(emptyForm);
  const [editMode, setEditMode] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const isEditing = !!athlete;

  function isStrongPassword(password: string): boolean {
    return /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
  }
  useEffect(() => {
    const fetchData = async () => {
      if (athlete) {
        // Normalização do atleta
        const a: any = athlete;
        const normalized = {
          ...athlete,
          fatherName: athlete.fatherName ?? a['father_name'] ?? '',
          fatherPhoneNumber: formatPhone(athlete.fatherPhoneNumber ?? a['father_phone'] ?? ''),
          motherName: athlete.motherName ?? a['mother_name'] ?? '',
          motherPhoneNumber: formatPhone(athlete.motherPhoneNumber ?? a['mother_phone'] ?? ''),
          bloodType: athlete.bloodType ?? a['blood_type'] ?? '',
          foodAllergies: athlete.foodAllergies ?? a['allergy'] ?? '',
          athletePhotoUrl: athlete.athletePhotoUrl ?? a['photo_url'] ?? '',
          frontIdPhotoUrl: athlete.frontIdPhotoUrl ?? a['photo_url_cpf_front'] ?? '',
          backIdPhotoUrl: athlete.backIdPhotoUrl ?? a['photo_url_cpf_back'] ?? '',
          birthday: (() => {
            const val = athlete.birthday ?? a['birthday'] ?? '';
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
              const [day, month, year] = val.split('/');
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            return val;
          })(),
          cpf: formatCPF(athlete.cpf ?? a['cpf'] ?? ''),
          phone: formatPhone(athlete.phone ?? a['phone'] ?? ''),
          rg: formatRG(athlete.rg ?? a['rg'] ?? ''),
          estado: a.address?.state ?? '',
          cidade: a.address?.city ?? '',
          bairro: a.address?.neighborhood ?? '',
          rua: a.address?.street ?? '',
          numeroDaCasa: a.address?.number ? a.address.number.toString() : '',
          complemento: a.address?.complement ?? '',
          referencia: a.address?.references ?? '',
        };
        setForm({ ...emptyForm, ...normalized, password: "" });
        setEditMode(false);
      } else {
        setForm(emptyForm);
        setEditMode(false);
      }
      // Buscar todas as modalidades e inscrições do atleta
      try {
        const [modalities, enrollments] = await Promise.all([
          getAllModalities(),
          athlete?.id ? getEnrollmentsByAthlete(athlete.id) : Promise.resolve([])
        ]);
        setAllModalities(modalities);
        // Montar estado inicial das checkboxes
        const enrollmentStateObj: Record<number, {enrollment: Enrollment|null, loading: boolean, error: string|null}> = {};
        modalities.forEach((mod: Modality) => {
          const found = enrollments.find((e: Enrollment) => e.modality.id === mod.id);
          enrollmentStateObj[mod.id] = { enrollment: found || null, loading: false, error: null };
        });
        setEnrollmentStates(enrollmentStateObj);
      } catch (err) {
        setAllModalities([]);
        setEnrollmentStates({});
      }
    };
    fetchData();
  }, [athlete]);

  // Função handleDeactivateEnrollment removida. Toda lógica de ativar/desativar inscrição está nos checkboxes.

  // Funções de formatação
  const formatCPF = (value: string) => value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  const formatRG = (value: string) => value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1})$/, "$1-$2");

  const formatPhone = (value: string) => value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");

  // Função formatDate removida pois não é usada.

  const formatCEP = (value: string) => value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === "cpf") formattedValue = formatCPF(value);
    if (name === "phone" || name === "fatherPhoneNumber" || name === "motherPhoneNumber") formattedValue = formatPhone(value);
    if (name === "rg") formattedValue = formatRG(value);
    // Não formatar birthday, pois agora é type=date
    if (name === "cep") formattedValue = formatCEP(value);
    setForm({ ...form, [name]: formattedValue });

    if (name === "cep" && /^\d{5}-\d{3}$/.test(formattedValue)) {
      fetch(`https://viacep.com.br/ws/${formattedValue.replace(/\D/g, "")}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setForm((f: typeof form) => ({
              ...f,
              estado: data.uf,
              cidade: data.localidade,
              bairro: data.bairro,
              rua: data.logradouro
            }));
          }
        });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profile", file);

    try {
      const response = await fetch("http://localhost:3002/api/uploads/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.profile) {
        setForm((prev: typeof form) => ({ ...prev, [field]: data.profile }));
      }
    } catch {
      console.error("Erro ao fazer upload da imagem.");
    }
  };

  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [genericError, setGenericError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && !editMode) return;
    setPasswordError("");
    setEmailError("");
    setSuccessMessage("");
    setGenericError("");
    if ((!isEditing || form.password) && !isStrongPassword(form.password || "")) {
      setPasswordError("A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.");
      return;
    }
    // Converte a data de nascimento para yyyy-mm-dd (ISO)
    const parseBirthday = (dateStr: string) => {
      if (!dateStr) return '';
      // Se já estiver no formato yyyy-mm-dd, retorna direto
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // Se estiver no formato dd/mm/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      // Se estiver no formato mm/dd/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [month, day, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return dateStr;
    };

    const payload: any = {
      ...form,
      birthday: parseBirthday(form.birthday),
      cpf: (form.cpf || '').replace(/\D/g, ""),
      rg: (form.rg || '').replace(/\D/g, ""),
      phone: (form.phone || '').replace(/\D/g, ""),
      father_name: (form.fatherName || '').trim(),
      father_phone: (form.fatherPhoneNumber || '').replace(/\D/g, ""),
      mother_name: (form.motherName || '').trim(),
      mother_phone: (form.motherPhoneNumber || '').replace(/\D/g, ""),
      photo_url: form.athletePhotoUrl || '',
      photo_url_cpf_front: form.frontIdPhotoUrl || '',
      photo_url_cpf_back: form.backIdPhotoUrl || ''
    };
    // Só envia password se preenchido
    if (form.password) {
      payload.password = form.password;
    } else {
      delete payload.password;
    }
    // Remove os campos camelCase do payload
    delete payload.fatherName;
    delete payload.fatherPhoneNumber;
    delete payload.motherName;
    delete payload.motherPhoneNumber;
    try {
      if (isEditing && athlete?.id) {
        // UPDATE direto igual EditarPerfil
        const url = `http://localhost:3002/api/athletes/${athlete.id}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        console.log('[UPDATE] Resposta do fetch (edição):', response);
        let responseData: any;
        try {
          responseData = await response.clone().json();
        } catch (e) {
          responseData = await response.text();
        }
        console.log('[UPDATE] Conteúdo do response:', responseData);
        if (!response.ok) {
          const errorText = JSON.stringify(responseData);
          console.error('[UPDATE] Erro ao atualizar atleta:', errorText);
          throw new Error('Erro ao atualizar atleta: ' + errorText);
        }
        // Atualiza o formulário/local state com os dados retornados
        if (responseData && typeof responseData === 'object') {
          setForm((prev: typeof form) => ({
            ...prev,
            ...responseData,
            estado: responseData.estado || '',
            cidade: responseData.cidade || '',
            bairro: responseData.bairro || '',
            rua: responseData.rua || '',
            numeroDaCasa: responseData.numeroDaCasa ? responseData.numeroDaCasa.toString() : '',
            complemento: responseData.complemento || '',
            referencia: responseData.referencia || '',
          }));
        }
        setSuccessMessage("Edição realizada com sucesso!");
        setEditMode(false);
        onSubmit({ ...payload, id: athlete.id } as Athlete); // Atualiza lista
      } else {
        // Cadastro normal
        const resp = await onSubmit(payload as Athlete);
        console.log('[CREATE] Resposta do onSubmit (cadastro):', resp);
        setSuccessMessage("Cadastro realizado com sucesso!");
      }
      setGenericError("");
      setEmailError("");
    } catch (err: any) {
      console.error('[ERROR] Erro no submit:', err);
      let backendMsg = isEditing ? "Erro ao editar." : "Erro ao cadastrar.";
      if (err.message) {
        backendMsg = err.message;
      }
      setGenericError(backendMsg);
      setSuccessMessage("");
    }
  };




  const handleCancel = () => {
    setForm(emptyForm);
    setEmailError("");
    setSuccessMessage("");
    setGenericError("");
    onCancel();
  };

  

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4 bg-[#D9D9D9] border border-black rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-4">Edição de Atleta</h2>
        <div className="flex gap-2">
          {/* Botão editar (lápis) e lixeira (remover) podem ser adicionados aqui, se existirem */}
          <button
            type="button"
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-black bg-[#D9D9D9] hover:bg-[#EB8317] transition-colors text-lg font-bold"
            style={{ lineHeight: 1 }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-2">
          {successMessage}
        </div>
      )}
      {genericError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
          {genericError}
        </div>
      )}

      {/* Dados Pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nome completo</label>
          <input name="name" type="text" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Data de nascimento</label>
          <input
            name="birthday"
            type="date"
            value={form.birthday}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm"
            disabled={isEditing && !editMode}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">CPF</label>
          <input name="cpf" type="text" maxLength={14} value={form.cpf} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">RG</label>
          <input name="rg" type="text" maxLength={12} value={form.rg} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Telefone</label>
          <input name="phone" type="text" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Telefone Secundário</label>
          <input name="phoneNumber" type="text" value={form.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
          {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
        </div>
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
          <PasswordRequirements password={form.password} />
          {passwordError && (
            <span className="text-red-600 text-xs mt-1 block">{passwordError}</span>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Alergias Alimentares</label>
          <input name="foodAllergies" type="text" value={form.foodAllergies} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Tipo Sanguíneo</label>
          <select
            name="bloodType"
            value={form.blood_type}
            onChange={handleChange}
            className="text-sm w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100"
            disabled={isEditing && !editMode}
          >
            <option value="">Selecione...</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Endereço */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm mb-1">CEP</label>
          <input name="cep" type="text" maxLength={9} value={form.cep} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Estado</label>
          <input name="estado" type="text" value={form.estado} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Cidade</label>
          <input name="cidade" type="text" value={form.cidade} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Bairro</label>
          <input name="bairro" type="text" value={form.bairro} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Rua</label>
          <input name="rua" type="text" value={form.rua} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Número</label>
          <input name="numeroDaCasa" type="text" value={form.numeroDaCasa} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Complemento</label>
          <input name="complemento" type="text" value={form.complemento} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Referência</label>
          <input name="referencia" type="text" value={form.referencia} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
      </div>

      {/* Informações Familiares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm mb-1">Nome do Pai</label>
          <input name="fatherName" type="text" value={form.fatherName || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Telefone do Pai</label>
          <input name="fatherPhoneNumber" type="text" value={form.fatherPhoneNumber || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Nome da Mãe</label>
          <input name="motherName" type="text" value={form.motherName || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Telefone da Mãe</label>
          <input name="motherPhoneNumber" type="text" value={form.motherPhoneNumber || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
      </div>

      {/*
      //Responsáveis 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm mb-1">Nome do Responsável</label>
          <input name="responsibleName" type="text" value={form.responsibleName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
        <div>
          <label className="block text-sm mb-1">Email do Responsável</label>
          <input name="responsibleEmail" type="email" value={form.responsibleEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-400 rounded-sm bg-gray-100 text-sm" disabled={isEditing && !editMode} />
        </div>
      </div>*/}


      {/* Fotos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  {[
    { name: "frontIdPhotoUrl", label: "Foto Frente do RG", value: form.frontIdPhotoUrl },
    { name: "backIdPhotoUrl", label: "Foto Verso do RG", value: form.backIdPhotoUrl },
    { name: "athletePhotoUrl", label: "Foto do Atleta", value: form.athletePhotoUrl },
  ].map(({ name, label, value }) => (
    <div key={name} className="relative">
      <label className="block text-sm mb-1">{label}</label>

      <input
        type="file"
        id={name}
        name={name}
        disabled={isEditing && !editMode}
        onChange={e => handleImageUpload(e, name)}
        className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
      />

      {value && (
        <img
          src={value}
          alt={label}
          className="mt-2 rounded w-24 h-24 object-cover border mb-3"
        />
      )}

      <label
        htmlFor={name}
        className={`bg-[#EB8317] border border-black rounded-sm hover:bg-[#EB8317]/75 text-sm text-white px-4 py-2  ${
          isEditing && !editMode ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Escolha o arquivo
      </label>
    </div>
  ))}
</div>
      <div>
      {isEditing && !editMode && (
        <button type="button" className="bg-[#EB8317] text-white py-2 px-4 rounded-md hover:scale-105 transition-transform border border-black" onClick={() => setEditMode(true)}>Editar</button>
      )}
      {isEditing && editMode && (
        <div className="flex gap-2">
        <button type="submit" className="bg-[#10375C] text-white py-2 px-4 rounded-md shadow-sm hover:scale-105 transition-transform border border-black">Salvar</button>
        <button type="button" onClick={handleCancel} className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-[#EB8317] transition-transform border border-black">Cancelar</button>
        </div>
      )}
      
      </div>
      
    </form>
  );
};

export default FormularioAtletas;

