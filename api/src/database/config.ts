import "reflect-metadata";
import { DataSource } from "typeorm";
import "reflect-metadata";
import env from "../environment/env";
import { seedOfAllEntities } from "../seeds/seed";

export const AppDataSource = new DataSource({
  type: "sqlite",
  // host: 'localhost',
  // port: 3306,
  // username: 'root',
  // password: 'senha',
  database: env.NODE_ENV ? "db.test.sqlite" : "db.sqlite",
  // url:"",
  synchronize: true, //sincroniza as alterações com o banco
  dropSchema: false, // !USAR SOMENTE EM DESENVOLVIMENTO: deleta todas as tabelas para sincronizar o banco
  logging: false, // loga as queries do banco
  entities: ["src/entities/*{.ts,.js}"],
  migrations: ["src/migrations/*.ts"],
  migrationsTableName: "migrations",
});

AppDataSource.initialize()
  .then(async () => {
  await AppDataSource.runMigrations();
  await resetAndSeedDatabase();

  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

async function resetAndSeedDatabase() {
  console.log("⚠️ Cleaning tables");
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    // 1. Desativa FKs temporariamente
    await queryRunner.query("PRAGMA foreign_keys = OFF");

    // 2. Obtém tabelas de forma específica para SQLite
    const tables = await getAllTablesSQLite(queryRunner);

    // 3. Limpeza adaptada para SQLite
    const deletionOrder = [
      "address",
      "enrollment", // Tabela que referencia outras
      "atendiment", // Tabela que referencia outras
      "teacher", // Tabela que referencia modality
      "athlete", // Tabela independente
      "modality", // Tabela independente
      // Adicione outras tabelas conforme necessário
    ].filter((table) => tables.includes(table));

    // 4. Limpeza na ordem correta
    for (const table of deletionOrder) {
      await queryRunner.query(`DELETE FROM "${table}";`);
      await queryRunner.query(
        `DELETE FROM sqlite_sequence WHERE name='${table}';`
      );
      console.log(`Tabela ${table} limpa`);
    }

    // 4. Reativa FKs
    await queryRunner.query("PRAGMA foreign_keys = ON");

    await queryRunner.commitTransaction();
    console.log("✅ All tables cleaned");
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("❌ Error resetting database:", error);
    throw error;
  } finally {
    await queryRunner.release();
  }

  console.log("Starting seed");
  await seedOfAllEntities();
  console.log("Finished seed");
}

async function getAllTablesSQLite(queryRunner): Promise<string[]> {
  const tables = await queryRunner.query(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations';`
  );
  return tables.map((row: { name: string }) => row.name);
}
