import React from "react";
import CustomButton from "./customButtom";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ModuloConfirmacao: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#d9d9d9] rounded p-6 w-80 shadow-md border border-black">
        <p className="text-center text-black font-bold">{message}</p>
        <div className="mt-4 flex justify-around gap-4">

          <CustomButton
            variant="gray"
            onClick={onClose}
            className=""
          >
           Cancelar
          </CustomButton>

           <CustomButton
            variant="orange"
            onClick={onConfirm}
            className=""
          >
           Confirmar
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ModuloConfirmacao;
