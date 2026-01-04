import React, { useEffect, useState } from "react";
import { Modality } from "@/types/Modality";
import {getProfessores } from "../services/professorService"; 
import { assignTeacherToModality} from "../services/modalityService"
interface AssignTeacherFormProps {
  modality: Modality;
  onCancel: () => void;
  onSubmitSuccess: () => void;
}

const AssignTeacherForm: React.FC<AssignTeacherFormProps> = ({ modality, onCancel, onSubmitSuccess }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    setLoading(true);
    try {
      await assignTeacherToModality(modality.id, { teacherId: selectedTeacher });
      onSubmitSuccess();
    } catch (err) {
      setError("Erro ao atribuir professor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form  className="" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Inscrever Professor à Modalidade</h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <label className="block mb-2 font-medium">Selecione o professor:</label>
      <select
        className="bg-[#d9d9d9] block w-full p-3 rounded-sm border border-black px-3 py-2 mb-4"
        value={selectedTeacher ?? ""}
        onChange={(e) => setSelectedTeacher(Number(e.target.value))}
      >
        <option value="" disabled>Selecione</option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name}
          </option>
        ))}
      </select>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel}  className="h-13 md:w-fit font-bold font-inter bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition duration-300">
          Cancelar
        </button>
        <button type="submit"   className="h-13 md:w-fit font-bold font-inter bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300" disabled={loading}>
          {loading ? "Salvando..." : "Atribuir"}
        </button>
      </div>
    </form>
  );
};

export default AssignTeacherForm;