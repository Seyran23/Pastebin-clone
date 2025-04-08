const dbConfig = {
  username: "postgres",
  password: "postgres",
  database: "new_project",
  host: "localhost",
  dialect: "postgres",
};

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
};
