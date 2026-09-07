import { Request, Response } from "express";

import { UserService } from "./user.service";
import { asyncHandler } from "../../utils/asyncHandler";

const userService = new UserService();

/**
 * All handlers use asyncHandler so that rejected promises (and thrown
 * ApiError subclasses) are forwarded to the global error handler, which maps
 * them to the correct HTTP status (404, 409, 400, 500, etc.).
 */

export const createUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
);

export const getUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await userService.getUsers();

    return res.json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  }
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);

    return res.json({
      success: true,
      data: user,
    });
  }
);

export const updateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);

    return res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await userService.deleteUser(req.params.id);

    return res.json({
      success: true,
      message: result.message,
    });
  }
);
