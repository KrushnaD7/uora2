import { prisma } from "../../config/prisma";
import {
  CreateAuthorInput,
  UpdateAuthorInput,
} from "./author.validation";

export class AuthorRepository {
  create(data: CreateAuthorInput) {
    return prisma.author.create({
      data,
    });
  }

  findAll() {
    return prisma.author.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findById(id: string) {
    return prisma.author.findUnique({
      where: {
        id,
      },
    });
  }

  findByEmail(email: string) {
    return prisma.author.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  update(id: string, data: UpdateAuthorInput) {
    return prisma.author.update({
      where: {
        id,
      },
      data,
    });
  }

  softDelete(id: string) {
    return prisma.author.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}