// src/presentation/http/controllers/GameController.ts
import { Request, Response, NextFunction } from 'express';
export class GameController {
  listSessions = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, data: [] });
  };
  createSession = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(201).json({ success: true, message: 'createSession — TODO' });
  };
  getSession = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'getSession — TODO' });
  };
  startSession = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'startSession — TODO' });
  };
  endSession = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, message: 'endSession — TODO' });
  };
  getLeaderboard = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({ success: true, data: [] });
  };
  getAvailableGameTypes = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.json({
      success: true,
      data: ['trivia', 'word_guess', 'drawing', 'tic_tac_toe', 'chess'],
    });
  };
}
