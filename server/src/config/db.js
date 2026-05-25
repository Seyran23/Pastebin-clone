require('dotenv').config({ path: '.env.local' });

const base = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'new_project',
  host: process.env.DB_HOST || process.env.DB_LOCALHOST || 'localhost',
  dialect: 'postgres',
};

module.exports = {
  development: { ...base },
  test: { ...base },
  production: {
    ...base,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
