import { Request, Response } from "express";

import { JournalService } from "./journal.service";

import { catchAsync } from "../../shared/catchAsync";


const journalService = new JournalService();



// Create Journal
export const createJournal = catchAsync(
  async (req: Request, res: Response) => {

    const journal =
      await journalService.createJournal(
        req.body
      );


    return res.status(201).json({

      success: true,

      message:
        "Journal created successfully",

      data: journal,

    });

  }
);



// Get All Journals
export const getAllJournals = catchAsync(
  async (req: Request, res: Response) => {

    const result =
      await journalService.getAllJournals(
        req.query
      );

    return res.status(200).json({

      success: true,

      message:
        "Journals fetched successfully",

      meta: result.meta,

      data: result.data,

    });

  }
);

// ======================================
// Get Journal By ID
// ======================================

export const getJournalById = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const journal =
      await journalService.getJournalById(
        req.params.id
      );

    return res.status(200).json({

      success: true,

      message: "Journal fetched successfully",

      data: journal,

    });

  }
);


// Update Journal
export const updateJournal = catchAsync(
  async (req: Request, res: Response) => {


    const journal =
      await journalService.updateJournal(
        req.params.id,
        req.body
      );



    return res.status(200).json({

      success: true,

      message:
        "Journal updated successfully",

      data: journal,

    });

  }
);



// Update Journal Settings
// (About / Aims & Scope / Publication Ethics / Guidelines / contact / socials)
export const updateJournalSettings = catchAsync(
  async (req: Request, res: Response) => {

    const settings =
      await journalService.updateJournalSettings(
        req.params.id,
        req.body
      );

    return res.status(200).json({

      success: true,

      message:
        "Journal settings updated successfully",

      data: settings,

    });

  }
);



// Update Journal Status
export const updateJournalStatus = catchAsync(
  async (req: Request, res: Response) => {


    const journal =
      await journalService.updateJournalStatus(
        req.params.id,
        req.body.status
      );



    return res.status(200).json({

      success: true,

      message:
        "Journal status updated successfully",

      data: journal,

    });

  }
);



// Delete Journal
export const deleteJournal = catchAsync(
  async (req: Request, res: Response) => {


    const journal =
      await journalService.deleteJournal(
        req.params.id
      );



    return res.status(200).json({

      success: true,

      message:
        "Journal deleted successfully",

      data: journal,

    });

  }
);
