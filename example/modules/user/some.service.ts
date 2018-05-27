import { Service, Application } from "../../../lib";


@Service()
export class SomeService {

  constructor(private app: Application) {
    // mongoose.connect('mongodb://admin:admin@ds211440.mlab.com:11440/users');
  }

  getAll(query) {
    // return User.find(query);
  }
}
