import { Service } from "../../lib";

@Service
export class UserService {
  constructor() {
    console.log('user service constructor')
  }

  getData() {
    return {
      data: 'some data'
    }
  }
}