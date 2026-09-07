import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { catchAsync } from "../../shared/catchAsync";
import { BadRequestError } from "../../errors/BadRequestError";

export const getMyNotifications = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Unauthorized");
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  }
);

export const markAsRead = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError("Unauthorized");
    }

    const updated = await prisma.notification.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: { isRead: true },
    });

    if (updated.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { id: req.params.id, isRead: true },
    });
  }
);
