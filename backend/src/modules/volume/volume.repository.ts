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

  /**
   * Full volume tree for a journal, used by the admin workspace.
   *
   * Deliberately UNFILTERED: this is the editorial view, so it must include
   * UPCOMING issues and not-yet-published articles. Filtering to published
   * records here made newly created issues invisible in the workspace -- the
   * issue saved fine, the UI never showed it, and creating it again failed
   * with a confusing "already exists". Public pages read published-only data
   * through the separate `public` module instead.
   */
  findByJournalId(journalId: string) {
    return prisma.volume.findMany({
      where: { journalId },
      include: {
        issues: {
          include: { articles: true },
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