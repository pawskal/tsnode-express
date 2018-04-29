import jwt from 'jsonwebtoken';
import { IAuthMiddleware, IAuthOptions, Request, Response } from './interfaces';

export class AuthMiddleware {
    constructor(req: Request, res: Response, next: Function, authProvider: IAuthMiddleware, authOptions: IAuthOptions) {
      const token = req.headers[authOptions.authorizationHeader.toLocaleLowerCase()] || req.query[authOptions.authorizationQueryParam]
      if(!token) {
        return res.status(401).send({ message: 'Unauthorized' });
      }
      const { success, data } = authProvider.verify(jwt.verify(token, authOptions.secret));
      if(!success) {
        return res.status(401).send({ message: 'Unauthorized' });
      }
      req.auth = data;
      next();
    }
  }
  