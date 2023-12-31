import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// TODO: make error log disappear while jest running
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger();

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`Incoming Request - ${req.method} ${req.originalUrl}`);

    next();
  }
}
