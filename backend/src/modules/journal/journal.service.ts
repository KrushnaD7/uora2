import { JournalRepository } from "./journal.repository";
import { CreateJournalDto } from "./journal.types";
import { UpdateJournalInput, UpdateJournalSettingsInput } from "./journal.validation";

import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";

import { BaseService } from "../../shared/database";
import { buildQuery } from "../../shared/query/query-builder";
import { getPaginationMeta } from "../../shared/query/pagination";

export class JournalService extends BaseService {

  constructor(
    private repository = new JournalRepository()
  ) {
    super();
  }

  // ===============================
  // Create Journal
  // ===============================

  async createJournal(data: CreateJournalDto) {

    const slugExists =
      await this.repository.findBySlug(
        data.slug
      );

    if (slugExists) {
      throw new ConflictError(
        "Journal slug already exists"
      );
    }

    const subdomainExists =
      await this.repository.findBySubdomain(
        data.subdomain
      );

    if (subdomainExists) {
      throw new ConflictError(
        "Journal subdomain already exists"
      );
    }

    return this.repository.create(data);

  }

  // ===============================
  // Get All Journals
  // ===============================

  async getAllJournals(query: any) {

    const prismaQuery =
      buildQuery({

        page: query.page,

        limit: query.limit,

        search: query.search,

        searchFields: [

          "name",

          "shortName",

          "slug",

          "issn"

        ],

        filters: {

          status: query.status

        },

        sortBy: query.sortBy,

        sortOrder: query.sortOrder

      });

    const result =
      await this.repository.findAll(
        prismaQuery
      );

    return {

      meta: getPaginationMeta(

        result.total,

        prismaQuery.page,

        prismaQuery.limit

      ),

      data: result.data

    };

  }

  // ===============================
  // Get Journal By ID
  // ===============================

  async getJournalById(id: string) {

    const journal =
      await this.repository.findById(id);

    if (!journal) {
      throw new NotFoundError(
        "Journal not found"
      );
    }

    return journal;

  }

  // ===============================
  // Update Journal
  // ===============================

  async updateJournal(
    id: string,
    data: UpdateJournalInput
  ) {

    const journal =
      await this.repository.findById(id);

    if (!journal) {
      throw new NotFoundError(
        "Journal not found"
      );
    }

    return this.repository.update(
      id,
      data
    );

  }

  // ===============================
  // Update Journal Settings
  // (About / Aims & Scope / Publication Ethics / Guidelines / contact / socials)
  // ===============================

  async updateJournalSettings(
    id: string,
    data: UpdateJournalSettingsInput
  ) {

    const journal =
      await this.repository.findById(id);

    if (!journal) {
      throw new NotFoundError(
        "Journal not found"
      );
    }

    return this.repository.upsertSettings(
      id,
      data
    );

  }

  // ===============================
  // Update Journal Status
  // ===============================

  async updateJournalStatus(

    id: string,

    status: "ACTIVE" | "INACTIVE"

  ) {

    const journal =
      await this.repository.findById(id);

    if (!journal) {
      throw new NotFoundError(
        "Journal not found"
      );
    }

    return this.repository.changeStatus(
      id,
      status
    );

  }

  // ===============================
  // Delete Journal
  // ===============================

  async deleteJournal(id: string) {

    const journal =
      await this.repository.findById(id);

    if (!journal) {
      throw new NotFoundError(
        "Journal not found"
      );
    }

    return this.repository.delete(id);

  }

}
