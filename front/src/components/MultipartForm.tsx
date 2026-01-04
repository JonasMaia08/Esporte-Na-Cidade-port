import React, { useState } from "react";
import CustomButton from "./customButtom";

import useNavigateTo from "../hooks/useNavigateTo";



interface FormStepProps {
  step: number;
  title: string;
  content: React.ReactNode;
}

interface MultipartFormProps {
  steps: FormStepProps[];
  onSubmit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
}

const MultipartForm: React.FC<MultipartFormProps> = ({ steps, onSubmit, onNext, onPrevious, currentStep }) => {
  const goTo = useNavigateTo()
  return (
    <div className="max-w-2xl mx-auto bg-[#F4F6FF] p-10 border border-black">
      <h1 className="text-2xl font-bold text-left mb-4">Cadastre-se</h1>
      <p className="text-gray-500 mb-6">Crie sua conta para começar</p>

      {/* Indicator */}
      <div className="flex justify-start space-x-4 mb-8">
        {steps.map((step) => (
          <div
            key={step.step}
            className={`w-full shadow-sm shadow-slate-500 rounded-full p-1 border border-black ${step.step <= currentStep ? "bg-[#10375c]" : "bg-[#f48716]"
              }`}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="mb-6">{steps[currentStep - 1].content}</div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        {currentStep == 1 ? (
          <CustomButton variant="blue" onClick={() => goTo("/")}>
            Cancelar
          </CustomButton>
        ) : (
          <CustomButton variant="blue" onClick={(onPrevious)} disabled={(currentStep === 1)}>
            Anterior
          </CustomButton>)}



        {currentStep === steps.length ? (


          <CustomButton variant="orange" onClick={(onSubmit)}>
            Finalizar
          </CustomButton>
        ) : (
          <CustomButton variant="orange" onClick={(onNext)}>
            Próximo
          </CustomButton>
        )}
      </div>
    </div>
  );
};

export default MultipartForm;
