import { NextFunction } from "express";

function middleware(req: Request, res: Response, next: NextFunction){
  console.log('Middleware');
  next();
}