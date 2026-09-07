import { prisma } from "../../config/prisma";

import {
  CreateIssueInput,
  UpdateIssueInput,
} from "./issue.validation";

export class IssueRepository {
  create(data: CreateIssueInput) {
    return prisma.issue.create({
      data,
    });
  }

  findAll() {
    return prisma.issue.findMany({
      include: {
        journal: true,
        volume: true,
      },
      orderBy: {
        issueNumber: "asc",
      },
    });
  }

  findById(id: string) {
    return prisma.issue.findUnique({
      where: {
        id,
      },
    });
  }

  findByVolumeAndNumber(
    volumeId: string,
    issueNumber: number
  ) {
    return prisma.issue.findUnique({
      where: {
        volumeId_issueNumber: {
          volumeId,
          issueNumber,
        },
      },
    });
  }

  update(
    id: string,
    data: UpdateIssueInput
  ) {
    return prisma.issue.update({
      where: {
        id,
      },
      data,
    });
  }

  delete(id: string) {
    return prisma.issue.delete({
      where: {
        id,
      },
    });
  }
}