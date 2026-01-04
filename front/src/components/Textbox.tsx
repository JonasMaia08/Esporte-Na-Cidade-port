import React, { ChangeEvent } from "react";

interface TextboxProps {
    label: string;
    name: string;
    value: string;
    placeholder?: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    iconPath?: string; // Ícone opcional, pode ser um SVG ou componente de ícone
    errorMessage?: string; // Mensagem de erro opcional
    type?: string; // Tipo do input (text, password, etc.)
    multiline?: boolean; // Define se o componente será uma textarea
    rows?: number; // Número de linhas para a textarea
    required?: boolean; // Define se o campo é obrigatório
    disabled?: boolean;
}

const Textbox: React.FC<TextboxProps> = ({
    label,
    name,
    value,
    placeholder = "",
    onChange,
    iconPath: icon,
    errorMessage,
    type = "text",
    multiline = false,
    rows = 4, // Número padrão de linhas para a textarea
    required = false, // Valor padrão é falso
    disabled = false,
}) => {
    return (
        <div className="relative my-5">
            <label className="block text-sm font-semibold">{label}</label>
            <div className="relative">
                {icon && (
                    <span className="absolute inset-y-0 left-0 flex items-start top-2.5 pl-3">
                        <img src={icon} alt="" className="w-7" />
                    </span>
                )}
                {multiline ? (
                    <textarea
                        required={required}
                        name={name}
                        value={value}
                        onChange={onChange}
                        rows={rows}
                        className={`pl-12 pr-4 py-3 bg-[#d9d9d9] mt-1 block w-full border ${
                            errorMessage ? "border-red-500" : "border-black"
                        } rounded-sm`}
                        placeholder={placeholder}
                    />
                ) : (
                    <input
                        required={required}
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={`pl-12 pr-4 py-3 bg-[#d9d9d9] mt-1 block w-full border ${
                            errorMessage ? "border-red-500" : "border-black"
                        } rounded-sm`}
                        placeholder={placeholder}
                    />
                )}
            </div>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        </div>
    );
};

export default Textbox;
