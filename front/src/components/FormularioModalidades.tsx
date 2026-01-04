import React, { useEffect, useState, forwardRef } from "react";
import { Modality } from "../types/Modality";
import Textbox from "./Textbox";
import { Button } from "./ui/button";
import { createModality } from "../services/modalityService";
import { getProfessores } from "../services/professorService";
interface Props {
  modalityEdicao?: Modality | null;
  onCancelEdit: () => void;
  onSuccess?: () => void;
}

type ModalityFormData = {
  name: string;
  description: string;
  days_of_week: string[];
  start_time: string;
  end_time: string;
  class_locations: string;
  teacherId: number | undefined;
};



interface FormularioModalidadesProps {
  modalityEdicao: Modality | null;
  onSubmit: (data: { name: string; description: string; days_of_week: string; start_time: string; end_time: string; class_locations: string; teacherId?: Number | undefined; }) => Promise<void>;
  onCancelEdit: () => void;
  onSucess?: () => void;
}

const diasSemana = [
  { nome: "Segunda", abreviado: "seg" },
  { nome: "Terça", abreviado: "ter" },
  { nome: "Quarta", abreviado: "qua" },
  { nome: "Quinta", abreviado: "qui" },
  { nome: "Sexta", abreviado: "sex" },
  { nome: "Sábado", abreviado: "sab" },
  { nome: "Domingo", abreviado: "dom" },
];


const FormularioModalidades = forwardRef<HTMLFormElement, FormularioModalidadesProps>(
  ({ modalityEdicao, onSubmit, onCancelEdit, onSucess }, ref) => {
    const [formData, setFormData] = useState<Omit<ModalityFormData, "id" | "teachers" | "registred_athletes">>({
      name: "",
      description: "",
      start_time: "",
      end_time: "",
      days_of_week: [],
      class_locations: "",
      teacherId: undefined,

    });

    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchTeachers = async () => {
        try {
          const data = await getProfessores();
          setTeachers(data);
        } catch (err) {
          setError("Erro ao carregar professores");
        }
      };

      fetchTeachers();
    }, []);

    useEffect(() => {
      if (modalityEdicao) {
        setFormData({
          name: modalityEdicao.name,
          description: modalityEdicao.description,
          days_of_week: modalityEdicao.days_of_week
            ? modalityEdicao.days_of_week.split(",").map((d: any) => d.trim())
            : [],
          start_time: modalityEdicao.start_time,
          end_time: modalityEdicao.end_time,
          class_locations: modalityEdicao.class_locations,
          teacherId: selectedTeacher || undefined
        });
      }
    }, [modalityEdicao]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    };



    const handleCheckboxChange = (abreviado: string) => {
      setFormData(prev => {
        const updatedDays = prev.days_of_week.includes(abreviado)
          ? prev.days_of_week.filter(d => d !== abreviado)
          : [...prev.days_of_week, abreviado];

        return {
          ...prev,
          days_of_week: updatedDays,
        };
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        await onSubmit({
          ...formData,
          teacherId: selectedTeacher || undefined,
          days_of_week: formData.days_of_week.join(",")
        })
        console.log(formData);

        if (onSucess) onSucess();
      } catch (err: any) {
        setError(err.message || "Erro ao criar modalidade");
      } finally {
        setLoading(false);
      }
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} className="mt-10">
        <h2 className="font-bold text-3xl mb-4">
          {modalityEdicao ? "Editar Modalidade" : "Cadastrar Modalidade"}
        </h2>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-8">
          <div className="w-full md:w-[45%] space-y-4">
            <Textbox
              value={formData.name}
              onChange={handleChange}
              name="name"
              label="Nome da Modalidade"
              placeholder="Ex: Natação"
              required
              disabled={loading}
            />

            <Textbox
              value={formData.description}
              onChange={handleChange}
              name="description"
              label="Descrição"
              placeholder="Descreva a modalidade"
              required
              multiline
              disabled={loading}
            />

            <Textbox
              value={formData.start_time}
              onChange={handleChange}
              name="start_time"
              label="Horário de Início"
              placeholder="Ex: 08:00"
              type="time"
              required
              disabled={loading}
            />

            <Textbox
              value={formData.end_time}
              onChange={handleChange}
              name="end_time"
              label="Horário de Término"
              placeholder="Ex: 10:00"
              type="time"
              required
              disabled={loading}
            />
          </div>

          <div className="w-full md:w-[45%] space-y-4 my-5 ">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold">Dias da Semana</label>
              <div className="bg-[#d9d9d9]  block w-full p-3 rounded-sm border border-black">
                <div className="grid grid-cols-1 gap-2 pb-[2px]">
                  {diasSemana.map(({ nome, abreviado }) => (
                    <label key={abreviado} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.days_of_week.includes(abreviado)}
                        onChange={() => handleCheckboxChange(abreviado)}
                        disabled={loading}
                        className="accent-blue-600"
                      />
                      {nome}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Textbox
              value={formData.class_locations}
              onChange={handleChange}
              name="class_locations"
              label="Locais de Aula (separe por vírgula)"
              placeholder="Piscina, Quadra, Campo"
              required
              disabled={loading}
            />

            {!modalityEdicao && (
              <div>
                <label className="block mb-2 font-medium">vincular professor (opcional)</label>
                <select
                  className="bg-[#d9d9d9]  block w-full p-3 rounded-sm border border-black"
                  value={selectedTeacher ?? ""}
                  onChange={(e) => setSelectedTeacher(Number(e.target.value))}
                >
                  <option value="">Não vincular</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>


        </div>

        <div className="mt-6 flex gap-4">
          <button
            className="h-13 md:w-fit font-bold font-inter bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
            type="submit"
          >
            {modalityEdicao ? "Salvar Alterações" : "Cadastrar Modalidade"}
          </button>

          <button
            className="h-13 md:w-fit font-bold font-inter bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition duration-300"
            type="button"
            onClick={onCancelEdit}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>


      </form>
    );
  }
);

export default FormularioModalidades;