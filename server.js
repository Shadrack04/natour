/* eslint-disable node/no-unsupported-features/es-syntax */
const dotenv = require('dotenv');
const app = require('./app');
const connectDb = require('./config/db');

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`App running on port ${port}...`);
  await connectDb();
});
