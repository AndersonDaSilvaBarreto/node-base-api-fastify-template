import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function userRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.post(
    "/",
    {
      schema: {
        body: z.object({
          name: z.string(),
          age: z.number(),
        }),
        
      },
    },
    async (request, reply) => {
      const { name, age } = request.body;
      return { message: `Usuário ${name} criado na rota separada!` };
    },
  );
}
