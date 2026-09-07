import { prisma } from "../config/prisma";

export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
