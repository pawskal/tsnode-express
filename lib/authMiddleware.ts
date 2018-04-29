import jwt from 'jsonwebtoken';
import { IAuthMiddleware, IAuthOptions, IRequest, IResponse, IAuthTarget } from './interfaces';

export class AuthMiddleware {
  constructor(req: IRequest, res: IResponse, next: Function, authProvider: IAuthMiddleware, authOptions: IAuthOptions, authTarget: IAuthTarget) {
    const token = req.headers[authOptions.authorizationHeader.toLocaleLowerCase()] || req.query[authOptions.authorizationQueryParam];
    console.log(authTarget);
    if(!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    const { success, data } = authOptions.strategy == 'jwt' ?
                              authProvider.verify(jwt.verify(token, authOptions.secret), authTarget) :
                              authProvider.verify(token, authTarget);
    if(!success) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    req.auth = data;
    next();
  }
}
  