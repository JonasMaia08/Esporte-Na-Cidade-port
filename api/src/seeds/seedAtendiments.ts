import { AppDataSource } from "../database/config";
import { Athlete } from "../entities/athlete.entity";
import { Modality } from "../entities/modality.entity";
import { Enrollment } from "../entities/enrollment.entity";
import { Teacher } from "../entities/teacher.entity";
import { Atendiment } from "../entities/atendiment.entity";
import { Roles } from "../enums/roles.enum";
import { Manager } from "../entities/manager.entity";

function getRandomDaysOfWeek() {
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  const selectedDays = days.filter(() => Math.random() > 0.5);
  return selectedDays.length > 0 ? selectedDays.join(",") : "Segunda"; // Garante pelo menos um dia
}

function getRandomTime() {
  const hours = Math.floor(Math.random() * 10) + 8; // Horário aleatório entre 08:00 e 17:00
  const minutes = Math.floor(Math.random() * 4) * 15; // Multiplicando por 15 para gerar 00, 15, 30 ou 45 minutos
  const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return time;
}

function getRandomEndTime(startTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const endHour = (startHour + 2) % 24; // Garantindo que o horário de fim não ultrapasse 24:00
  const endTime = `${String(endHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
  return endTime;
}

async function seed() {
  await AppDataSource.initialize();

  const athleteRepo = AppDataSource.getRepository(Athlete);
  const modalityRepo = AppDataSource.getRepository(Modality);
  const enrollmentRepo = AppDataSource.getRepository(Enrollment);
  const atendimentRepo = AppDataSource.getRepository(Atendiment);
  const teacherRepo = AppDataSource.getRepository(Teacher);
  const managerRepo = AppDataSource.getRepository(Manager);


  // criar manager ana senha 123456789 email ana@teste.com
  let manager = await managerRepo.findOneBy({ name: "Gestora Ana" });

if (!manager) {
  manager = managerRepo.create({
    name: "Gestora Ana",
    password: "$2b$10$dxK9s52R400Rhgg/2GjbheTGK0BartuE743YTbJiF2VGfEWWe1TpS", 
    cpf: "11223344556",
    birthday: "1975-05-20",
    phone: "11977777777",
    rg: "1122334",
    role: Roles.MANAGER,
    email: "ana@teste.com",
    photo_url: "",
  });
  await managerRepo.save(manager);
}

  // 2. Buscar ou criar o atleta João
  let athlete = await athleteRepo.findOneBy({ name: "João" });

  if (!athlete) {
    athlete = athleteRepo.create({
      name: "João",
      password: "$2b$10$dxK9s52R400Rhgg/2GjbheTGK0BartuE743YTbJiF2VGfEWWe1TpS",
      cpf: "12345678900",
      birthday: "2005-01-01",
      phone: "11999999999",
      rg: "1234567",
      role: Roles.ATHLETES,
      father_name: "Pai do João",
      mother_name: "Mãe do João",
      responsible_person_name: "Responsável João",
      email: "joao@teste.com",
      photo_url: "",
    });
    await athleteRepo.save(athlete);
  }

  // 2.1 Buscar ou criar o professor Carlos
  let teacher = await teacherRepo.findOneBy({ name: "Professor Carlos" });
  if (!teacher) {
    teacher = teacherRepo.create({
      name: "Professor Carlos",
      password: "$2b$10$dxK9s52R400Rhgg/2GjbheTGK0BartuE743YTbJiF2VGfEWWe1TpS",
      cpf: "98765432100",
      birthday: "1980-01-01",
      phone: "11988888888",
      rg: "7654321",
      role: Roles.TEACHER,
      about: "Professor de futebol experiente.",
      email: "carlos@teste.com",
      photo_url: "",
      modality: null, // será associada abaixo
    });
    await teacherRepo.save(teacher);
  }

  await modalityRepo.clear();
  await enrollmentRepo.clear();

  // 3. Criar modalidades se não existirem
  const modalityNames = ["Futebol", "Basquete", "Capoeira"];
  const modalities: Modality[] = [];

  for (const name of modalityNames) {
    let modality = await modalityRepo.findOneBy({ name });

    if (!modality) {
      const startTime = getRandomTime();  // Gerando horário de início aleatório
      const endTime = getRandomEndTime(startTime);  // Gerando horário de término aleatório baseado no início

      modality = modalityRepo.create({
        name,
        description: `${name} para iniciantes`,
        days_of_week: getRandomDaysOfWeek(), // Randomizando os dias da semana
        start_time: startTime,
        end_time: endTime,
        class_locations: "Quadra 1",
      });
      await modalityRepo.save(modality);
    }

    modalities.push(modality);
  }

  // 3.1 Relacionar o professor à modalidade Futebol
  const futebol = modalities.find((m) => m.name === "Futebol");
  if (futebol && teacher) {
    teacher.modality = futebol;
    await teacherRepo.save(teacher);
  }

  // 4. Criar atendimentos variados
  const atendiments = atendimentRepo.create([
    { athlete, modality: modalities[0], present: false },
    { athlete, modality: modalities[0], present: true },
    { athlete, modality: modalities[1], present: false },
    { athlete, modality: modalities[2], present: true },
    { athlete, modality: modalities[1], present: true },
  ]);
  await atendimentRepo.save(atendiments);

  console.log("Seed inserido com sucesso!");
}

async function main() {
  try {
    await seed();
  } catch (error) {
    console.error("Erro ao rodar seed:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

main();