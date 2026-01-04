import { format, addDays } from 'date-fns';
import axios from 'axios';

// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Lista de locais e horários para as aulas teste
const LOCATIONS: string[] = [
    'Ginásio', 'Campinho', 'Raspadão', 'Pista', 'Quadra', 'Mergulho'
];

const TIME_SLOTS: string[] = [
    '08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00'
];

// Função para gerar horários aleatórios
function getRandomTimeSlots(count: number): string[] {
    const slots: string[] = [];
    while (slots.length < count) {
        const randomSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
        if (!slots.includes(randomSlot)) {
            slots.push(randomSlot);
        }
    }
    return slots;
}

// Função para gerar aulas para um dia específico
function generateDaySchedule(): { name: string; time: string }[] {
    const schedule: { name: string; time: string }[] = [];
    const numClasses = Math.floor(Math.random() * 4) + 1; // 1 a 4 aulas por dia
    
    const timeSlots = getRandomTimeSlots(numClasses);
    
    timeSlots.forEach(time => {
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        schedule.push({
            name: location,
            time: time
        });
    });
    
    return schedule;
}

// Função principal para adicionar aulas teste
async function addTestSchedule(professorId: string) {
    try {
        // Gerar horários para hoje e amanhã
        const todaySchedule = generateDaySchedule();
        const tomorrowSchedule = generateDaySchedule();

        // Enviar para a API
        const response = await axios.post(`${API_BASE_URL}/professores/${professorId}/schedule`, {
            today: todaySchedule,
            tomorrow: tomorrowSchedule
        });

        console.log('Horários de teste adicionados com sucesso!');
        console.log('Horários de hoje:', todaySchedule);
        console.log('Horários de amanhã:', tomorrowSchedule);
        
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar horários de teste:', error);
        throw error;
    }
}

// Função para obter o ID do professor do token
async function getProfessorIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Token não encontrado. Faça login primeiro.');
    }

    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) throw new Error('Token inválido');

        const payload = JSON.parse(atob(payloadBase64));
        return payload.id;
    } catch (error) {
        throw new Error('Não foi possível extrair o ID do professor do token');
    }
}

// Função principal para executar o script
async function main() {
    try {
        console.log('Iniciando script de adição de horários de teste...');
        
        // Obter ID do professor
        const professorId = await getProfessorIdFromToken();
        console.log('ID do professor:', professorId);

        // Adicionar horários de teste
        await addTestSchedule(professorId);
        console.log('Script concluído com sucesso!');
    } catch (error) {
        console.error('Erro ao executar script:', error);
    }
}

// Executar o script
main();
