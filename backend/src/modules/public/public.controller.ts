import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import { catchAsync } from "../../shared/catchAsync";
import { PublicService } from "./public.service";
import { resolveUploadPath } from "../../utils/file";


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
     * pdfUrl is stored as a public-looking path, e.g. /uploads/filename.pdf.
     *
     * Resolve it with the shared helper rather than joining against the
     * working directory: uploads live in a configured directory outside the
     * deployment (so redeploys don't delete them), and the helper also keeps
     * the result inside that directory.
     */
    let filePath: string;
    try {
      filePath = resolveUploadPath(article.pdfUrl);
    } catch {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message:
          "File not found"
      });
    }

    // Detect the actual file type from the stored file extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    const downloadExt = ext || ".pdf";
    const isPdf = ext === ".pdf";

    // Inline view (render inside the browser)
    if (req.query.view === "1") {

      res.setHeader(
        "Content-Type",
        contentType
      );

      // PDFs can render inline; DOC/DOCX must be downloaded
      res.setHeader(
        "Content-Disposition",
        isPdf
          ? `inline; filename="${article.title}${downloadExt}"`
          : `attachment; filename="${article.title}${downloadExt}"`
      );

      return res.sendFile(
        filePath
      );

    }


    return res.download(

      filePath,

      `${article.title}${downloadExt}`

    );


  }
);