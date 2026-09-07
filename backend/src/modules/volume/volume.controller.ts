import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { VolumeService } from "./volume.service";

const volumeService = new VolumeService();

// Create Volume
export const createVolume = catchAsync(
  async (req: Request, res: Response) => {
    const volume =
      await volumeService.createVolume(req.body);

    return res.status(201).json({
      success: true,
      message: "Volume created successfully",
      data: volume,
    });
  }
);

// Get All Volumes
export const getAllVolumes = catchAsync(
  async (_req: Request, res: Response) => {
    const volumes =
      await volumeService.getAllVolumes();

    return res.status(200).json({
      success: true,
      message: "Volumes fetched successfully",
      data: volumes,
    });
  }
);

// Get Volumes by Journal ID
export const getVolumesByJournalId = catchAsync(
  async (req: Request, res: Response) => {
    const volumes =
      await volumeService.getVolumesByJournalId(req.params.journalId);

    return res.status(200).json({
      success: true,
      message: "Volumes fetched successfully",
      data: volumes,
    });
  }
);

// Get Volume
export const getVolumeById = catchAsync(
  async (req: Request, res: Response) => {
    const volume =
      await volumeService.getVolumeById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Volume fetched successfully",
      data: volume,
    });
  }
);

// Update Volume
export const updateVolume = catchAsync(
  async (req: Request, res: Response) => {
    const volume =
      await volumeService.updateVolume(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Volume updated successfully",
      data: volume,
    });
  }
);

// Delete Volume
export const deleteVolume = catchAsync(
  async (req: Request, res: Response) => {
    await volumeService.deleteVolume(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Volume deleted successfully",
    });
  }
);