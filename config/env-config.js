/* eslint-disable node/no-unsupported-features/es-syntax */
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

export const { DATABASE_URL, DATABASE_PASSWORD } = process.env;
