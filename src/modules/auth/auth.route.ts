import type { FastifyTypeInstance } from "../../types/fastifyInstance.js";
import { loginRequestSchema } from "./dto/auth-login.request.dto.js";
import * as authService from "./auth.service.js";
import { signupRequestSchema } from "./dto/auth-signup.request.dto.js";
import { AppError } from "../../errors/app_error.js";
import type { FastifyRequest } from "fastify";
import type { RouteGenericInterface } from "fastify";
export function authRoute(fastify: FastifyTypeInstance) {
  fastify.post(
    "/signup",
    { schema: { body: signupRequestSchema } },
    async (request, reply) => {
      const { name, email, password } = request.body;
      const newUser = await authService.signupUser({ name, email, password });
      return reply.status(201).send();
    },
  );
  fastify.post(
    "/signin",
    {
      schema: {
        body: loginRequestSchema,
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const { userId, refreshToken } = await authService.login({
        email,
        password,
      });
      const access_token = fastify.jwt.sign(
        { sub: userId },
        { expiresIn: "5m" },
      );

      const onPruduction: boolean = process.env.NODE_ENV === "production";
      return reply
        .setCookie("access_token", access_token, {
          path: "/",
          httpOnly: true,
          secure: onPruduction,
          sameSite: "strict",
          maxAge: 60 * 5,
          signed: true,
        })
        .setCookie("refresh_token", refreshToken, {
          path: "/",
          httpOnly: true,
          secure: onPruduction,
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          signed: true,
        })
        .status(200)
        .send({ message: "Autenticado com sucesso" });
    },
  );
  fastify.post("/refresh_token", async (request, reply) => {
    const refreshTokenCookie = request.cookies.refresh_token;

    if (!refreshTokenCookie) {
      throw new AppError(
        "Refresh Token não enviado, inválido ou expirado! 0",
        401,
      );
    }

    const { value, valid } = request.unsignCookie(refreshTokenCookie);

    console.log({ valorRecebido: value });
    if (!valid) {
      throw new AppError(
        "Refresh Token não enviado, inválido ou expirado! 1",
        401,
      );
    }

    const { userId, refresh_token } = await authService.refreshToken(value);

    const access_token = fastify.jwt.sign({ sub: userId });

    const onPruduction: boolean = process.env.NODE_ENV === "production";

    return reply
      .setCookie("access_token", access_token, {
        path: "/",
        httpOnly: true,
        secure: onPruduction,
        sameSite: "strict",
        maxAge: 60 * 5,
        signed: true,
      })
      .setCookie("refresh_token", refresh_token, {
        path: "/",
        httpOnly: true,
        secure: onPruduction,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        signed: true,
      })
      .status(200)
      .send({ message: "Refresh de token concluído" });
  });
}
