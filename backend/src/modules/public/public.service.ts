import { PublicRepository } from "./public.repository";

import { NotFoundError } from "../../errors/NotFoundError";


export class PublicService {


  constructor(
    private repository = new PublicRepository()
  ) {}



  // Get Active Journals

  async getJournals() {

    return this.repository.getJournals();

  }




  // Get Journal By Slug

  async getJournalBySlug(
    slug: string
  ) {


    const journal =
      await this.repository.getJournalBySlug(
        slug
      );


    if (!journal) {

      throw new NotFoundError(
        "Journal not found"
      );

    }


    return journal;

  }




  // Get All Published Issues

  async getIssues() {

    return this.repository.getIssues();

  }




  // Get Public Volume With Issues

  async getVolumeById(
    id: string
  ) {


    const volume =
      await this.repository.getVolumeById(
        id
      );


    if (!volume) {

      throw new NotFoundError(
        "Volume not found"
      );

    }


    return volume;

  }




  // Get Public Issue With Articles

  async getIssueById(
    id: string
  ) {


    const issue =
      await this.repository.getIssueById(
        id
      );


    if (!issue) {

      throw new NotFoundError(
        "Issue not found"
      );

    }


    return issue;

  }




  // Get Published Articles

  async getArticles() {

    return this.repository.getArticles();

  }




  // Lightweight lookup used only by the PDF-download endpoint.

  async getArticleFileInfo(
    id: string
  ) {

    const article =
      await this.repository.getArticleFileInfo(
        id
      );

    if (!article) {

      throw new NotFoundError(
        "Article not found"
      );

    }

    return article;

  }




  // Get Article Details

  async getArticleById(
    id: string
  ) {


    const article =
      await this.repository.getArticleById(
        id
      );


    if (!article) {

      throw new NotFoundError(
        "Article not found"
      );

    }


    return article;

  }


}
