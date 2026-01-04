import "reflect-metadata"; // deve ser o primeiro import
import { DataSource } from "typeorm";
import env from "../environment/env";
import { seedOfAllEntities } from "../seeds/seed";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: env.NODE_ENV === "test" ? "db.test.sqlite" : "db.sqlite",

  synchronize: false, // ❗ desativei (no seu caso, Render = prod)
  dropSchema: false,
  logging: false,

  // entidades devem apontar para o dist compilado
  entities: ["dist/entities/*.js"],

  // migrations também do dist
  migrations: ["dist/migrations/*.js"],
  migrationsTableName: "migrations",
});

AppDataSource.initialize()
  .then(async () => {
    console.log("🚀 DataSource inicializado");

    // roda migrations do dist
    await AppDataSource.runMigrations();
    console.log("📦 Migrations executadas");

    // reseta e popula
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
    await queryRunner.query("PRAGMA foreign_keys = OFF");

    const tables = await getAllTablesSQLite(queryRunner);

    const deletionOrder = [
      "address",
      "enrollment",
      "atendiment",
      "teacher",
      "athlete",
      "modality",
      "material",
      "documentation",
      "release",
      "manager",
    ].filter((table) => tables.includes(table));

    for (const table of deletionOrder) {
      await queryRunner.query(`DELETE FROM "${table}";`);
      await queryRunner.query(`DELETE FROM sqlite_sequence WHERE name='${table}';`);
      console.log(`Tabela ${table} limpa`);
    }

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

  console.log("🌱 Starting seed");
  await seedOfAllEntities();
  console.log("🏁 Finished seed");
}

async function getAllTablesSQLite(queryRunner): Promise<string[]> {
  const tables = await queryRunner.query(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations';`
  );
  return tables.map((row: { name: string }) => row.name);
}
