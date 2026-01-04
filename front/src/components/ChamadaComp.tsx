import React, { useState, useEffect } from "react";
import ModuloConfirmacao from "./ModuloConfirmacao";
import { AtletaAtivos } from "../pages/Chamada";
import api from "../services/api";
import useNavigateTo from "../hooks/useNavigateTo";
import CustomButton from "./customButtom";

interface AttendanceProps {
  userType: "professor" | "atleta";
  initialStudents: AtletaAtivos[];
}

const ChamadaComp: React.FC<AttendanceProps> = ({
  userType,
  initialStudents,
}) => {
  const [students, setStudents] = useState<AtletaAtivos[]>(initialStudents);
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>({
    date: "",
    time: "",
  });
  const [observation, setObservation] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalityName, setModalityName] = useState("");
  const GoTo = useNavigateTo();

  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().substring(0, 5);
    setDateTime({ date: currentDate, time: currentTime });


    const fetchModalityName = async () => {
      try {
        const response = await api.get("/modality");
        const modality = response.data.find(
          (mod: any) => mod.id === initialStudents[0]?.modalityId
        );
        if (modality) {
          setModalityName(modality.name);
        }
      } catch (error) {
        console.error("Erro ao buscar modalidade:", error);
      }
    };


    fetchModalityName();

  }, [initialStudents]);

  const toggleStatus = (studentId: number) => {
    if (userType === "professor") {
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId
            ? {
              ...student,
              status: student.status === "PRESENTE" ? "AUSENTE" : "PRESENTE",
              absences:
                student.status === "PRESENTE"
                  ? student.faltas + 1
                  : student.faltas - 1,
            }
            : student
        )
      );
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleConfirm = async () => {
    try {
      const formatDateTime = (dateStr: string, timeStr: string) => {
        const [hours, minutes] = timeStr.split(":");
        return `${dateStr} ${hours}:${minutes}:00.000`;
      };

      const formattedDateTime = formatDateTime(dateTime.date, dateTime.time);

      const atendiments = students.map((student) => ({
        modalityId: student.modalityId, // Certifique-se que modalityId existe no student
        athleteId: student.id,
        present: student.status === "PRESENTE",
        created_at: formattedDateTime,
        description: observation || undefined,
      }));

      const response = await api.post(
        `modality/${students[0].modalityId}/receive-atendiments`,
        atendiments
      );

      //console.log("Chamada gravada com sucesso:", response.data);
      setIsModalOpen(false);
      GoTo("/home-professor");
    } catch (error) {
      console.error("Erro ao gravar chamada:", error);
    }
  };
  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateTime((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 min-h-screen  px-20 ">

      <h2 className="text-2xl font-bold pl-6 pt-8">Realizar Chamada</h2>
      <div className=" grid grid-cols-1 sm:grid-cols-2   gap-6 pt-8 ">
        {/* ...modalidade e data... */}
        <div className="bg-[#d9d9d9] p-4 border border-black rounded-lg ">
          <div className="bg-white opacity-100 p-2    rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border flex flex-col border-black ">
            <label className="block text-gray-700 mb-1">
              Informe a data da chamada:
            </label>
            <input
              type="date"
              name="date"
              value={dateTime.date}
              onChange={handleDateTimeChange}
              className="w-full p-2 "
            />
          </div>
        </div>
        <div className="bg-[#d9d9d9] p-4 border border-black rounded-lg">
          <div className="bg-white opacity-100 p-2    rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border flex flex-col border-black ">
            <label className="block text-gray-700 mb-1">Informe o horário:</label>
            <input
              type="time"
              name="time"
              value={dateTime.time}
              onChange={handleDateTimeChange}
              className="w-full p-2 "
            />
          </div>
        </div>
        <div className="bg-[#d9d9d9] p-4 border border-black rounded-lg col-span-1 sm:col-span-2">
          <div className="bg-white opacity-100 p-2 rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border flex flex-col border-black">
            <label className="block text-gray-700 mb-1">Observações (opcional):</label>
            <textarea
              value={observation}
              onChange={e => setObservation(e.target.value)}
              placeholder="Digite observações gerais desta chamada..."
              className="w-full p-2 min-h-[60px]"
            />
          </div>
        </div>
      </div>

      {/* <button className="bg-[#EB8317] mb-6 text-black py-2 px-4 mt-6 rounded border border-black">
        Gerar Lista de Chamada
      </button> */}

      <div className="space-y-4 mt-6 bg-[#d9d9d9] border border-black p-4 rounded-lg ">
        <p className="text-2xl font-semibold">Alunos da modalidade</p>

        {students.map((student) => (
          <div
            key={student.id}
            className="p-4 animate-slide-in-fade p-4 animate-slide-in-fade bg-white opacity-100 p-2    rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] border flex flex-col border-black cursor-pointer"
            onClick={() => toggleStatus(student.id)}
          >
            <div className="flex items-center">
              <img
                src={student.photo_url || "https://via.placeholder.com/50"}
                alt={student.name}
                className="rounded-full mr-4 w-12 h-12 sm:w-14 sm:h-14 object-cover"
                style={{
                  maxWidth: "56px",
                  minWidth: "48px",
                }}
              />
              <div className="flex-1">

                <h3 className="font-semibold">{student.name}</h3>
                <p className="text-xs text-gray-600 break-all">{student.email}</p>
                <p
                  className={`  font-bold ${student.status === "PRESENTE"
                    ? "text-green-500 transition-all "
                    : "text-red-500 transition-all "
                    }`}
                >
                  {student.status}
                </p>
                <p>{student.faltas} Faltas</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CustomButton
        variant="orange"
        onClick={handleOpenModal}
        className="mt-8 self-end"
      >
        Gravar chamada
      </CustomButton>
      <ModuloConfirmacao
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        message="Você tem certeza que deseja gravar a chamada?"
      />
    </div>
  );
};

export default ChamadaComp;
