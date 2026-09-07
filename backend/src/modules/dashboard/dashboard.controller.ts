import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DashboardService } from "./dashboard.service";

const dashboardService = new DashboardService();

// Get Dashboard
export const getDashboard = catchAsync(
  async (_req: Request, res: Response) => {
    const dashboard =
      await dashboardService.getDashboard();

    return res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      data: dashboard,
    });
  }
);