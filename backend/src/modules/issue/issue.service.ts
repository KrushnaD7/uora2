import { IssueRepository } from "./issue.repository";
import { JournalRepository } from "../journal/journal.repository";
import { VolumeRepository } from "../volume/volume.repository";

import {
  CreateIssueInput,
  UpdateIssueInput,
} from "./issue.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

export class IssueService {
  constructor(
    private repository = new IssueRepository(),
    private journalRepository = new JournalRepository(),
    private volumeRepository = new VolumeRepository()
  ) {}

  // Create Issue
  async createIssue(data: CreateIssueInput) {
    const journal = await this.journalRepository.findById(
      data.journalId
    );

    if (!journal || journal.deletedAt) {
      throw new NotFoundError("Journal not found");
    }

    const volume = await this.volumeRepository.findById(
      data.volumeId
    );

    if (!volume) {
      throw new NotFoundError("Volume not found");
    }

    if (volume.journalId !== data.journalId) {
      throw new ConflictError("Volume does not belong to the specified journal");
    }

    const existing =
      await this.repository.findByVolumeAndNumber(
        data.volumeId,
        data.issueNumber
      );

    if (existing) {
      throw new ConflictError(
        "Issue already exists in this volume"
      );
    }

    return this.repository.create(data);
  }

  // Get All Issues
  async getAllIssues() {
    return this.repository.findAll();
  }

  // Get Issue By ID
  async getIssueById(id: string) {
    const issue = await this.repository.findById(id);

    if (!issue) {
      throw new NotFoundError("Issue not found");
    }

    return issue;
  }

  // Update Issue
  async updateIssue(
    id: string,
    data: UpdateIssueInput
  ) {
    const issue = await this.repository.findById(id);

    if (!issue) {
      throw new NotFoundError("Issue not found");
    }

    return this.repository.update(id, data);
  }

  // Publish Issue
  async publishIssue(
    id: string,
    data: { publishedAt?: Date }
  ) {
    const issue = await this.repository.findById(id);

    if (!issue) {
      throw new NotFoundError("Issue not found");
    }

    return this.repository.update(id, {
      status: "PUBLISHED",
      publishedAt: data.publishedAt || new Date(),
    });
  }

  // Delete Issue
  async deleteIssue(id: string) {
    const issue = await this.repository.findById(id);

    if (!issue) {
      throw new NotFoundError("Issue not found");
    }

    await this.repository.delete(id);
  }
}