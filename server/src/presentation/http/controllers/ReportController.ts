import { Request, Response, NextFunction } from 'express';
import { ReportModel } from '../../../infrastructure/database/schemas/ReportSchema';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { Logger } from '../../../shared/utils/Logger';

const logger = Logger.getInstance();

export class ReportController {
  createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reporterId = (req as AuthenticatedRequest).userId;
      const { reportedId, reason, context } = req.body;

      if (!reportedId || !reason) {
        res.status(400).json({ success: false, message: 'Reported player and reason are required' });
        return;
      }

      const report = await ReportModel.create({
        reporterId,
        reportedId,
        reason,
        context,
        status: 'PENDING'
      });

      logger.info(`🚨 [Safety] User ${reporterId} reported ${reportedId}. Reason: ${reason}`);

      res.status(201).json({ 
        success: true, 
        message: 'Report submitted successfully. Thank you for keeping Indplay safe.',
        reportId: report._id 
      });
    } catch (e) {
      next(e);
    }
  };
}
