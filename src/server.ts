import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT);
const app = buildApp();
try {
  await app.listen({ port: PORT });
  console.log(`🚀 Servidor voando na porta ${PORT}`);
  console.log(`📚 Docs em http://localhost:${PORT}/documentation`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
