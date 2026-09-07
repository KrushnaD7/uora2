import { Request, Response } from "express";

import { catchAsync } from "../../shared/catchAsync";

import { ArticleService } from "./article.service";


const articleService =
  new ArticleService();








// Publish Article
export const publishArticle = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const article =
      await articleService.publishArticle(
        req.body
      );


    return res.status(201).json({

      success: true,

      message:
        "Article published successfully",

      data: article

    });


  }
);




// Get All Articles

export const getAllArticles = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const result =
      await articleService.getAllArticles(
        req.query
      );

    return res.status(200).json({

      success: true,

      message:
        "Articles fetched successfully",

      meta: result.meta,

      data: result.data

    });

  }
);




// Get Article By ID

export const getArticleById = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const article =
      await articleService.getArticleById(
        req.params.id
      );


    return res.status(200).json({

      success: true,

      message:
        "Article fetched successfully",

      data: article

    });


  }
);




// Update Article

export const updateArticle = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const article =
      await articleService.updateArticle(
        req.params.id,
        req.body
      );


    return res.status(200).json({

      success: true,

      message:
        "Article updated successfully",

      data: article

    });


  }
);




// Delete Article

export const deleteArticle = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    await articleService.deleteArticle(
      req.params.id
    );


    return res.status(200).json({

      success: true,

      message:
        "Article deleted successfully"

    });


  }
);