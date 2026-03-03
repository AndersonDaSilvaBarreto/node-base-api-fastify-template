import bcrypt from "bcrypt";
import { AppError } from "../../errors/app_error.js";
import { prisma } from "../../libs/prisma.js";
import type { LoginRequestDto } from "./dto/auth-login.request.dto.js";
import { uuidv7 } from "uuidv7";
import type { SignupRequestDto } from "./dto/auth-signup.request.dto.js";

export async function signupUser(dto: SignupRequestDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (user) {
     throw new AppError("Email já está em uso");
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const newUser = await prisma.user.create({
    data: {
      id: uuidv7(),
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  return newUser;
}

export async function login(dto: LoginRequestDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) {
    throw new AppError("Email ou senha inválidos", 401);
  }
  const passwordHashCompare = await bcrypt.compare(dto.password, user.password);
  if (!passwordHashCompare) {
    throw new AppError("Email ou senha incorreta!", 401);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const refreshToken = await prisma.refreshToken.create({
    data: {
      id: uuidv7(),
      userId: user.id,
      token: uuidv7(),
      expiresAt: expiresAt,
    },
  });
  return {
    userId: user.id,
    refreshToken: refreshToken.token,
  };
}
