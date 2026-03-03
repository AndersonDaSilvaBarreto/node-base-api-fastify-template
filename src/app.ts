import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import { AppError } from "./errors/app_error.js";
import { userRoute } from "./modules/users/users.route.js";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { authRoute } from "./modules/auth/auth.route.js";
export function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors);
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "http://localhost:5173",
        ],
        connectSrc: ["'self'", "http://localhost:5173"],
      },
    },
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "SampleApi",
        description: "Sample backend service",
        version: "1.0.0",
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
  });

  app.register(authRoute, { prefix: "/auth" });
  app.register(userRoute, { prefix: "/users" });

  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET as string,
    hook: "onRequest",
  });
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
    cookie: {
      cookieName: "access_token",
      signed: false,
    },
  });

  app.get("/ping", async function ping(request, reply) {
    return { pong: true };
  });
  app.setErrorHandler((err, req, reply) => {
    if (err instanceof AppError) {
      return reply.status(err.statusCode).send({
        status: "error",
        message: err.message,
      });
    }
    if (hasZodFastifySchemaValidationErrors(err)) {
      return reply.code(400).send({
        error: "Response Validation Error",
        message: "Request doesn't match the schema",
        statusCode: 400,
        details: {
          issues: err.validation,
          method: req.method,
          url: req.url,
        },
      });
    }

    if (isResponseSerializationError(err)) {
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Response doesn't match the schema",
        statusCode: 500,
        details: {
          issues: err.cause.issues,
          method: err.method,
          url: err.url,
        },
      });
    }
  });
  return app;
}
