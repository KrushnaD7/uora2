import { AuthorRepository } from "./author.repository";
import {
  CreateAuthorInput,
  UpdateAuthorInput,
} from "./author.validation";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

export class AuthorService {
  constructor(
    private repository = new AuthorRepository()
  ) {}

  // Create Author
  async createAuthor(data: CreateAuthorInput) {
  if (data.email) {
    const exists = await this.repository.findByEmail(data.email);

    if (exists) {
      throw new ConflictError("Author email already exists");
    }
  }

  const author = await this.repository.create(data);

  return author;
}

  // Get All Authors
  async getAllAuthors() {
    return this.repository.findAll();
  }

  // Get Author By ID
  async getAuthorById(id: string) {
    const author = await this.repository.findById(id);

    if (!author || author.deletedAt) {
      throw new NotFoundError("Author not found");
    }

    return author;
  }

  // Update Author
  async updateAuthor(
    id: string,
    data: UpdateAuthorInput
  ) {
    const author = await this.repository.findById(id);

    if (!author || author.deletedAt) {
      throw new NotFoundError("Author not found");
    }

    return this.repository.update(id, data);
  }

  // Delete Author
  async deleteAuthor(id: string) {
    const author = await this.repository.findById(id);

    if (!author || author.deletedAt) {
      throw new NotFoundError("Author not found");
    }

    return this.repository.softDelete(id);
  }
}