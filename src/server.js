const app = require('./app');
const config = require('./config/env');
const { initializeDatabase } = require('./db/database');

async function bootstrap() {
  await initializeDatabase();

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Swagger docs: http://localhost:${config.port}/api/docs`);
    console.log('Default admin: +998900000000 / admin12345');
  });
}

bootstrap().catch((err) => {
  console.error('Server start error:', err);
  process.exit(1);
});
