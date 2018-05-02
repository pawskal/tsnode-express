import { Service, Application } from "../../../lib";
import { User } from './user.model';
import mongoose from 'mongoose';


@Service
export class UserService {

  constructor(private app: Application) {
    mongoose.connect('mongodb://admin:admin@ds211440.mlab.com:11440/users');
  }

  getAll(query) {
    return User.find(query);
  }

  create(user: IUser){
    return User.create(user);
  }
}
