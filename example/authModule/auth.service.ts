import { Injectable, ConfigProvider } from "../../lib";

class User {
  constructor(public name, public password, public role) { }
  toJSON() {
    return { name: this.name, role: this.role }
  }
}
const users = [
  { name: 'John Doe', role: 'super', password: 'qwerty9' },
  { name: 'Jane Doe', role: 'admin', password: 'qwerty8' },
]

@Injectable()
export class AuthService {
  private users: Array<User> = users.map(({name, role, password}) => new User(name, password, role));
  constructor(public config: ConfigProvider) { }

  addUser({ name, password, role }) {
    this.users.push(new User(name, password, role))
  }

  getUsers() {
    return this.users
  }
  getUser(uName) {
    return this.users.find(({ name }) => name == uName)
  }
}