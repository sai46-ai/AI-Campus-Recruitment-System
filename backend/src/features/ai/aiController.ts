import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/middleware/auth';
import { aiService } from './services/aiService';
import AppError from '../../shared/utils/appError';
import asyncHandler from '../../shared/utils/asyncHandler';

export const parseResumeHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new AppError('Resume text content is required for parsing.', 400);
  }

  try {
    const result = await aiService.parseResume(text, req.id);
    res.status(200).json({
      success: true,
      data: result,
      correlationId: req.id,
    });
  } catch (err: any) {
    if (err.message?.includes('temporarily unavailable')) {
      throw new AppError(err.message, 503);
    }
    throw err;
  }
});

export const matchCandidateHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    candidateSkills = [],
    resumeText = '',
    jobTitle = 'Target Role',
    jobDescription = '',
    requiredSkills = [],
  } = req.body;

  if (!Array.isArray(requiredSkills)) {
    throw new AppError('requiredSkills must be an array of skill strings.', 400);
  }

  try {
    const result = await aiService.matchCandidate(
      Array.isArray(candidateSkills) ? candidateSkills : [],
      typeof resumeText === 'string' ? resumeText : '',
      typeof jobTitle === 'string' ? jobTitle : 'Target Role',
      typeof jobDescription === 'string' ? jobDescription : '',
      requiredSkills,
      req.id
    );

    res.status(200).json({
      success: true,
      data: result,
      correlationId: req.id,
    });
  } catch (err: any) {
    if (err.message?.includes('temporarily unavailable')) {
      throw new AppError(err.message, 503);
    }
    throw err;
  }
});

export const getAiStatusHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const diagnostics = await aiService.getDiagnostics();
  res.status(200).json({
    success: true,
    data: diagnostics,
    correlationId: req.id,
  });
});
