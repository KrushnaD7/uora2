import { VolumeRepository } from "./volume.repository";
import { JournalRepository } from "../journal/journal.repository";

import {
  CreateVolumeInput,
  UpdateVolumeInput,
} from "./volume.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

export class VolumeService {
  constructor(
    private repository = new VolumeRepository(),
    private journalRepository = new JournalRepository()
  ) {}

  // Create Volume
  async createVolume(data: CreateVolumeInput) {
    // Check journal exists
    const journal = await this.journalRepository.findById(
      data.journalId
    );

    if (!journal || journal.deletedAt) {
      throw new NotFoundError("Journal not found");
    }

    // Check duplicate volume
    const existing =
      await this.repository.findByJournalAndNumber(
        data.journalId,
        data.volumeNumber
      );

    if (existing) {
      throw new ConflictError(
        "Volume already exists for this journal"
      );
    }

    return this.repository.create(data);
  }

  // Get All Volumes
  async getAllVolumes() {
    return this.repository.findAll();
  }

  // Get Volumes by Journal ID
  async getVolumesByJournalId(journalId: string) {
    return this.repository.findByJournalId(journalId);
  }

  // Get Volume
  async getVolumeById(id: string) {
    const volume = await this.repository.findById(id);

    if (!volume) {
      throw new NotFoundError("Volume not found");
    }

    return volume;
  }

  // Update Volume
  async updateVolume(
    id: string,
    data: UpdateVolumeInput
  ) {
    const volume = await this.repository.findById(id);

    if (!volume) {
      throw new NotFoundError("Volume not found");
    }

    return this.repository.update(id, data);
  }

  // Delete Volume
  async deleteVolume(id: string) {
    const volume = await this.repository.findById(id);

    if (!volume) {
      throw new NotFoundError("Volume not found");
    }

    await this.repository.delete(id);
  }
}