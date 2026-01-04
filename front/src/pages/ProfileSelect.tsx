import React from 'react';
import useNavigateTo from "../hooks/useNavigateTo";

const AthleteIcon = () => <span className="text-4xl"><img src="/atleta-icon.png" alt="icon" className="w-20 h-20 md:w-32 md:h-32 object-contain"/></span>; 
const TeacherIcon = () => <span className="text-4xl"><img src="/professor-icon.png" alt="icon" className="w-12 h-12 md:w-20 md:h-20 object-contain"/></span>;
const ManagerIcon = () => <span className="text-4xl"><img src="/gestor-icon.png" alt="icon" className="w-16 h-16 md:w-24 md:h-24 object-contain" /></span>;

const ProfileSelect = () => {
  const GoTo = useNavigateTo();

  return (
    <>
   <div className="relative min-h-screen bg-[#F4F6FF]">
   <h1 className="absolute top-7 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 text-2xl mb-10 font-jockey text-black">
    ESPORTE NA CIDADE
</h1>
  <main className="flex flex-col items-center justify-center min-h-screen p-4">

    <div className="text-center mb-10 mt-12">
      
      <h2 className="text-3xl md:text-4xl font-bold font-inter text-black mb-2">Quem sou eu?</h2>
      <p className="text-base md:text-lg font-inter text-black">Selecione seu tipo de usuário para começar</p>
    </div>

    <div className="flex flex-col md:flex-row gap-10 md:gap-10 items-center">
      
      <div className="flex flex-col items-center ">
        <button   
          onClick={()=> GoTo("/login-atleta")} 
          className="w-32 h-32 md:w-52 md:h-52 bg-[#D9D9D9] rounded-md shadow-sm shadow-slate-500 text-black hover:scale-105 hover:bg-[#EB8317] transition-transform flex items-center justify-center border border-black">
          <AthleteIcon />
        </button>

        <p className="mt-4 font-medium text-black">Atleta</p>
      </div>

      <div className="flex flex-col items-center">
        <button 
          onClick={()=> GoTo("/login-professor")}
          className="w-32 h-32 md:w-52 md:h-52 bg-[#D9D9D9] rounded-md shadow-sm shadow-slate-500 text-black hover:scale-105 hover:bg-[#EB8317] transition-transform flex items-center justify-center border border-black">
          <TeacherIcon />
        </button>

        <p className="mt-4 font-medium text-black">Professor</p>
      </div>

      <div className="flex flex-col items-center">
        <button 
          onClick={()=> GoTo("/login-gestor")} 
          className="w-32 h-32 md:w-52 md:h-52 bg-[#D9D9D9] rounded-md shadow-sm shadow-slate-500 text-black hover:scale-105 hover:bg-[#EB8317] transition-transform flex items-center justify-center border border-black">
          <ManagerIcon />
        </button>

        <p className="mt-4 font-medium text-black">Gestor</p>
      </div>

    
    </div>

  </main>
</div>

  </>
  
  );
};
export default ProfileSelect;
