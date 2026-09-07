import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import { catchAsync } from "../../shared/catchAsync";
import { PublicService } from "./public.service";


const publicService = new PublicService();



// ==================================
// Get All Journals
// ==================================

export const getPublicJournals = catchAsync(
  async (
    _req: Request,
    res: Response
  ) => {


    const journals =
      await publicService.getJournals();


    return res.status(200).json({

      success: true,

      message:
        "Journals fetched successfully",

      data: journals

    });

  }
);





// ==================================
// Get Journal By Slug
// ==================================

export const getPublicJournalBySlug = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const journal =
      await publicService.getJournalBySlug(
        req.params.slug
      );


    return res.status(200).json({

      success: true,

      message:
        "Journal fetched successfully",

      data: journal

    });

  }
);





// ==================================
// Get All Published Issues
// ==================================

export const getPublicIssues = catchAsync(
  async (
    _req: Request,
    res: Response
  ) => {


    const issues =
      await publicService.getIssues();


    return res.status(200).json({

      success: true,

      message:
        "Issues fetched successfully",

      data: issues

    });

  }
);




// ==================================
// Get Public Volume By ID
// ==================================

export const getPublicVolumeById = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const volume =
      await publicService.getVolumeById(
        req.params.id
      );


    return res.status(200).json({

      success: true,

      message:
        "Volume fetched successfully",

      data: volume

    });

  }
);




// ==================================
// Get Public Issue By ID
// ==================================

export const getPublicIssueById = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const issue =
      await publicService.getIssueById(
        req.params.id
      );


    return res.status(200).json({

      success: true,

      message:
        "Issue fetched successfully",

      data: issue

    });

  }
);




// ==================================
// Get All Public Articles
// ==================================

export const getPublicArticles = catchAsync(
  async (
    _req: Request,
    res: Response
  ) => {


    const articles =
      await publicService.getArticles();


    return res.status(200).json({

      success: true,

      message:
        "Articles fetched successfully",

      data: articles

    });

  }
);





// ==================================
// Get Public Article By ID
// ==================================

export const getPublicArticleById = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const article =
      await publicService.getArticleById(
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






// ==================================
// Download Article PDF
// ==================================

export const downloadArticlePDF = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const article =
      await publicService.getArticleFileInfo(
        req.params.id
      );



    if (!article) {

      return res.status(404).json({

        success: false,

        message:
          "Article not found"

      });

    }



    if (!article.pdfUrl) {

      return res.status(404).json({

        success: false,

        message:
          "PDF not available"

      });

    }



    /**
     * pdfUrl examples:
     *   /uploads/filename.pdf          (from submission manuscript)
     *   /uploads/articles/filename.pdf (legacy/imported articles)
     *
     * Strip /uploads prefix and resolve against the uploads directory.
     */
    const cleanPath =
      article.pdfUrl.replace(
        /^\/uploads/,
        ""
      );

    const filePath =
      path.join(
        process.cwd(),
        "uploads",
        cleanPath
      );



    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message:
          "PDF file not found"
      });
    }


    // Inline view (render inside the browser)
    if (req.query.view === "1") {

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${article.title}.pdf"`
      );

      return res.sendFile(
        filePath
      );

    }


    return res.download(

      filePath,

      `${article.title}.pdf`

    );


  }
);