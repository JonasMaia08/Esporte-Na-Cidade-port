import React from "react";

interface PasswordRequirementsProps {
  password: string;
}

const requirements = [
  {
    label: "Pelo menos 6 caracteres",
    test: (pw: string) => pw.length >= 6,
  },
  {
    label: "Pelo menos uma letra maiúscula (A-Z)",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: "Pelo menos uma letra minúscula (a-z)",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    label: "Pelo menos um número (0-9)",
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    label: "Pelo menos um caractere especial (!@#$...)",
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
];

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  return (
    <ul className="text-xs mt-2 list-disc list-inside">
      {requirements.map((req, idx) => {
        const met = req.test(password);
        return (
          <li key={idx} className={"flex items-center gap-1 " + (met ? "text-blue-600" : "text-gray-700") }>
            {met ? (
              <span className="text-blue-600 mr-1">✔</span>
            ) : (
              <span className="text-gray-400 mr-1">○</span>
            )}
            {req.label}
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordRequirements;
