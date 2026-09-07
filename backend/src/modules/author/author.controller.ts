import { Request, Response } from "express";
import { AuthorService } from "./author.service";
import { catchAsync } from "../../shared/catchAsync";

const authorService = new AuthorService();

// Create Author
export const createAuthor = catchAsync(
  async (req: Request, res: Response) => {
    const author = await authorService.createAuthor(req.body);

    return res.status(201).json({
      success: true,
      message: "Author created successfully",
      data: author,
    });
  }
);

// Get All Authors
export const getAllAuthors = catchAsync(
  async (_req: Request, res: Response) => {
    const authors = await authorService.getAllAuthors();

    return res.status(200).json({
      success: true,
      message: "Authors fetched successfully",
      data: authors,
    });
  }
);

// Get Author By ID
export const getAuthorById = catchAsync(
  async (req: Request, res: Response) => {
    const author = await authorService.getAuthorById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Author fetched successfully",
      data: author,
    });
  }
);

// Update Author
export const updateAuthor = catchAsync(
  async (req: Request, res: Response) => {
    const author = await authorService.updateAuthor(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Author updated successfully",
      data: author,
    });
  }
);

// Delete Author
export const deleteAuthor = catchAsync(
  async (req: Request, res: Response) => {
    await authorService.deleteAuthor(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Author deleted successfully",
    });
  }
);