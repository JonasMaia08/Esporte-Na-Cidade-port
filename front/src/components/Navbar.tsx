import React from "react";

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-24 py-5 bg-[#F4F6FF] shadow-md">
            <div className="text-lg font-jockey">ESPORTE NA CIDADE</div>
            <div className="flex gap-6 items-center font-bold">
                <a href="/home-atleta" className="text-gray-700 hover:text-orange-500">
                    Home
                </a>
                <a href="/faltas" className="text-gray-700 hover:text-orange-500">
                    Faltas
                </a>
                <a href="/modalidade" className="text-gray-700 hover:text-orange-500">
                    Modalidade
                </a>
                <a href="/calendario" className="text-gray-700 hover:text-orange-500">
                    Calendário
                </a>
                <div className="w-8 h-8 bg-gray-200 border-black border"></div>
            </div>
        </nav>
    );
};

export default Navbar;
