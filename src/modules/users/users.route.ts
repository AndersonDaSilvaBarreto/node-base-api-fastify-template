import type { FastifyTypeInstance } from "../../types/fastifyInstance.js";
import { authenticate } from "../auth/middlewares/auth.middleware.js";
import * as userService from "./users.service.js";
export async function userRoute(fastify: FastifyTypeInstance) {
  fastify.get("/", async (request, reply) => {
   
    const users = await userService.getUsers();
    reply.send(users);
  });
}
