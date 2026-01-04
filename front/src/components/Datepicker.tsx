import React, { ChangeEvent, useState } from "react";

interface DatepickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  iconPath?: string;
  errorMessage?: string;
  max?: string;
}

const Datepicker: React.FC<DatepickerProps> = ({
  label,
  name,
  value,
  onChange,
  iconPath: icon,
  errorMessage,
  max,
}) => {
  const [localError, setLocalError] = useState("");

  return (
    <div className="relative">
      <label className="block text-sm font-semibold">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <img src={icon} alt="" className="w-9" />
          </span>
        )}
        <input
          required
          type="date"
          name={name}
          value={value}
          onChange={(e) => {
            setLocalError(""); // Limpa erro ao mudar
            onChange(e);
          }}
          onInvalid={(e) => {
            e.preventDefault();
            if (max) {
              setLocalError(`O Gestor deve ser maior de 18 anos.`);
            } else {
              setLocalError("Data inválida.");
            }
          }}
          onInput={() => setLocalError("")}
          max={max}
          className={`pl-12 pr-4 py-3 bg-[#d9d9d9] mt-1 block w-full border ${
            errorMessage || localError ? "border-red-500" : "border-black"
          } rounded-sm`}
        />
      </div>
      {(errorMessage || localError) && (
        <p className="text-red-500 text-sm mt-1">{errorMessage || localError}</p>
      )}
    </div>
  );
};

export default Datepicker;
