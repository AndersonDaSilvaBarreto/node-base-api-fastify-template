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

  const hashedPassword = await bcrypt.hash(dto.password, 12);

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
      email: true,
    },
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

export async function refreshToken(oldRefreshToken: string) {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });
  if (!tokenRecord) {
    throw new AppError("Refresh Token não enviado, inválido ou expirado! 2", 401);
  }

  if (new Date() > tokenRecord.expiresAt) {
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    throw new AppError("Refresh Token não enviado, inválido ou expirado! 3", 401);
  }

  const newRefreshToken = uuidv7();
  let expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { token: newRefreshToken },
  });

  return { userId: tokenRecord.userId, refresh_token: newRefreshToken };
}
