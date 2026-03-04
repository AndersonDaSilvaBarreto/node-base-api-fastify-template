import { prisma } from "../../libs/prisma.js";


export async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
}
