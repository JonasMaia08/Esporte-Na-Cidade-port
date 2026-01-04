import HeaderBasic from "../components/navigation/HeaderBasic";
import React from "react";
import { Link } from "react-router-dom";



export const RedirecionarHome: React.FC = () => {
    return (
        <div>
            <div className="min-h-screen bg-[#F4F6FF] flex flex-col pb-16">
                <HeaderBasic 
                    logo="hide" />
                <main className="flex flex-col justify-center  items-center flex-1">
                    <div className="flex flex-col m-4 md:mx-20 p-4 md:px-24 py-7 md:py-12 w-full max-w-5xl">
                        <div className=" px-8 mb-8 text-center flex flex-col space-y-14">
                            <h2 className="text-4xl font-bold ">
                                Cadastro Realizado com sucesso!
                            </h2>
                            <Link to="/" className="font-inter text-blue-600 ">
                                Voltar para a pagina inicial
                            </Link>
                        </div>
                    </div>
                </main>
                <footer className="w-full text-center mt-auto">
                    <p className="text-sm text-gray-500">
                        2024 Esporte na cidade. All rights reserved.
                    </p>
                </footer>
            </div>

        </div>
    );
};