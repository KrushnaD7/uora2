import { Request, Response } from "express";

import { catchAsync } from "../../shared/catchAsync";

import { EditorialDecisionService } from "./editorial-decision.service";


const editorialDecisionService =
  new EditorialDecisionService();



// Make Editorial Decision

export const makeDecision = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const submission =
      await editorialDecisionService.makeDecision(
        req.params.id,
        req.body,
        req.user!.id,
        req.user!.role
      );


    return res.status(200).json({

      success: true,

      message:
        "Editorial decision recorded successfully",

      data: submission

    });


  }
);




// Get Status History

export const getStatusHistory = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {


    const history =
      await editorialDecisionService.getStatusHistory(
        req.params.id,
        { id: req.user!.id, email: req.user!.email, role: req.user!.role }
      );


    return res.status(200).json({

      success: true,

      message:
        "Status history fetched successfully",

      data: history

    });


  }
);