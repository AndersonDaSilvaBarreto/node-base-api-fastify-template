import type { FastifyTypeInstance } from "../../types/fastifyInstance.js";
import * as userService from "./users.service.js";
export async function userRoute(fastify: FastifyTypeInstance) {
  fastify.addHook("preHandler", fastify.authenticate);
  fastify.get("/", async (request, reply) => {
    const users = await userService.getUsers();
    return reply.send(users);
  });
}
