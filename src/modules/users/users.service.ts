import { prisma } from "../../libs/prisma.js";

import { AppError } from "../../errors/app_error.js";

export function getUsers() {
  const users = prisma.user.findMany();
  return users;
}
