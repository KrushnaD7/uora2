import { prisma } from "../../config/prisma";

import {
  CreateVolumeInput,
  UpdateVolumeInput,
} from "./volume.validation";

export class VolumeRepository {
  create(data: CreateVolumeInput) {
    return prisma.volume.create({
      data,
    });
  }

  findAll() {
    return prisma.volume.findMany({
      include: {
        journal: true,
      },
      orderBy: {
        year: "desc",
      },
    });
  }

  findByJournalId(journalId: string) {
    return prisma.volume.findMany({
      where: { journalId },
      include: {
        issues: {
          where: { status: "PUBLISHED" },
          include: {
            articles: {
              where: { publishedAt: { not: null } }
            }
          },
          orderBy: { issueNumber: 'asc' }
        }
      },
      orderBy: {
        volumeNumber: "desc",
      },
    });
  }

  findById(id: string) {
    return prisma.volume.findUnique({
      where: {
        id,
      },
    });
  }

  findByJournalAndNumber(
    journalId: string,
    volumeNumber: number
  ) {
    return prisma.volume.findUnique({
      where: {
        journalId_volumeNumber: {
          journalId,
          volumeNumber,
        },
      },
    });
  }

  update(
    id: string,
    data: UpdateVolumeInput
  ) {
    return prisma.volume.update({
      where: {
        id,
      },
      data,
    });
  }

  delete(id: string) {
    return prisma.volume.delete({
      where: {
        id,
      },
    });
  }
}