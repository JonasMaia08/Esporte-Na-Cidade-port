import React, { ChangeEvent, ReactNode } from "react";

interface DropdownProps {
    label: string;
    name: string;
    value: number | string; // Aceita número ou string
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    iconPath?: string; // Ícone opcional
    errorMessage?: string; // Mensagem de erro opcional
    children: ReactNode; // As opções serão passadas como children
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    name,
    value,
    onChange,
    iconPath: icon,
    errorMessage,
    children,
}) => {
    return (
        <div className="relative">
            <label className="block text-sm font-semibold">{label}</label>
            <div className="relative">
                {icon && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <img src={icon} alt="" className="w-7" />
                    </span>
                )}
                <select
                    required={true}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`pl-12 pr-4 py-3 bg-[#d9d9d9] mt-1 block w-full border ${errorMessage ? "border-red-500" : "border-black"
                        } rounded-sm`}
                >
                    {children}
                </select>
            </div>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        </div>
    );
};

export default Dropdown;
