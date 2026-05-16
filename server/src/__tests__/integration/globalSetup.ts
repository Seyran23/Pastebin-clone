import { Sequelize } from 'sequelize';

// Runs once before all integration test files (separate worker — no vi.mock access)
export async function setup() {
  const db = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'postgres',
    database: 'pastebin_test',
    logging: false,
  });

  await db.authenticate();
  await db.query('DROP SCHEMA public CASCADE');
  await db.query('CREATE SCHEMA public');
  await db.close();
}

export async function teardown() {
  // Nothing needed — test worker connections close with the process
}
