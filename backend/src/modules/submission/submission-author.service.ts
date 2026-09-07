import { SubmissionAuthorRepository } from "./submission-author.repository";
import { SubmissionRepository } from "./submission.repository";
import { AuthorRepository } from "../author/author.repository";

import { AttachAuthorInput } from "./submission-author.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

export class SubmissionAuthorService {
  constructor(
    private repository = new SubmissionAuthorRepository(),
    private submissionRepository = new SubmissionRepository(),
    private authorRepository = new AuthorRepository()
  ) {}

  // Attach Author
  async attachAuthor(
    submissionId: string,
    data: AttachAuthorInput
  ) {
    // 1. Check Submission Exists
    const submission =
      await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    // 2. Check Author Exists
    const author =
      await this.authorRepository.findById(data.authorId);

    if (!author || author.deletedAt) {
      throw new NotFoundError("Author not found");
    }

    // 3. Check Duplicate
    const alreadyAttached =
      await this.repository.findBySubmissionAndAuthor(
        submissionId,
        data.authorId
      );

    if (alreadyAttached) {
      throw new ConflictError(
        "Author already attached to this submission"
      );
    }

    // 4. Check Corresponding Author
    if (data.isCorresponding) {
      const corresponding =
        await this.repository.findCorrespondingAuthor(
          submissionId
        );

      if (corresponding) {
        throw new ConflictError(
          "Submission already has a corresponding author"
        );
      }
    }

    // 5. Attach Author
    return this.repository.attachAuthor(
      submissionId,
      data
    );
  }

  // Get Submission Authors
  async getSubmissionAuthors(
    submissionId: string
  ) {
    const submission =
      await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    return this.repository.findSubmissionAuthors(
      submissionId
    );
  }

  // Remove Author
  async removeAuthor(
    submissionId: string,
    authorId: string
  ) {
    const attached =
      await this.repository.findBySubmissionAndAuthor(
        submissionId,
        authorId
      );

    if (!attached) {
      throw new NotFoundError("Author not attached");
    }

    await this.repository.removeAuthor(
      submissionId,
      authorId
    );
  }
}