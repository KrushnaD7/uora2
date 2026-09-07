import { prisma } from "../../config/prisma";

import {
  CreateJournalInput,
  UpdateJournalInput,
  UpdateJournalSettingsInput,
} from "./journal.validation";

import { BaseRepository } from "../../shared/database";

export class JournalRepository extends BaseRepository {

  // ===============================
  // Create Journal
  // ===============================

  create(data: CreateJournalInput) {

    return prisma.journal.create({

      data,

    });

  }

  // ===============================
  // Get All Journals
  // ===============================

  async findAll(query: any) {

    const [data, total] =
      await Promise.all([

        prisma.journal.findMany({

          where: {
            deletedAt: null,
            ...query.where,
          },

          orderBy: query.orderBy,

          skip: query.skip,

          take: query.take,

          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
            subdomain: true,
            issn: true,
            eissn: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },

        }),

        prisma.journal.count({

          where: {
            deletedAt: null,
            ...query.where,
          },

        }),

      ]);

    return {
      data,
      total,
    };

  }

  // ===============================
  // Get Journal By ID
  // ===============================

  findById(id: string) {

    return prisma.journal.findUnique({

      where: {

        id,

        deletedAt: null,

      },

      include: {

        settings: true,

      },

    });

  }

  // ===============================
  // Find By Slug
  // ===============================

  findBySlug(slug: string) {

    return prisma.journal.findUnique({

      where: {

        slug,

      },

    });

  }

  // ===============================
  // Find By Subdomain
  // ===============================

  findBySubdomain(
    subdomain: string
  ) {

    return prisma.journal.findUnique({

      where: {

        subdomain,

      },

    });

  }

  // ===============================
  // Update Journal
  // ===============================

  update(
    id: string,
    data: UpdateJournalInput
  ) {

    return prisma.journal.update({

      where: {

        id,

      },

      data,

    });

  }

  // ===============================
  // Upsert Journal Settings
  // (About / Aims & Scope / Ethics / Guidelines / contact / socials)
  // ===============================

  upsertSettings(
    journalId: string,
    data: UpdateJournalSettingsInput
  ) {

    // Normalize empty strings to null so "clearing" a field in the admin
    // UI actually clears it back to the public page's fallback copy,
    // rather than storing an empty string.
    const normalized = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    return prisma.journalSetting.upsert({

      where: {

        journalId,

      },

      create: {

        journalId,

        ...normalized,

      },

      update: normalized,

    });

  }

  // ===============================
  // Change Status
  // ===============================

  changeStatus(
    id: string,
    status: "ACTIVE" | "INACTIVE"
  ) {

    return prisma.journal.update({

      where: {

        id,

      },

      data: {

        status,

      },

    });

  }

  // ===============================
  // Delete Journal
  // ===============================

  delete(id: string) {

    return prisma.journal.delete({

      where: {

        id,

      },

    });

  }

}
