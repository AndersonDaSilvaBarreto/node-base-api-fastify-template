import z from "zod";
import type { FastifyTypeInstance } from "../types/fastifyInstance.js";

export async function userRoutes(fastify: FastifyTypeInstance) {
  fastify.post(
    "/",
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;
      return;
    },
  );
}
