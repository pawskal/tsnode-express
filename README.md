## README

### Download package
```
npm init -y
npm install tsnode-express --save
```

### Configure tsconfig.json
```
{
  "compilerOptions": {
    "target": "es6",                     
    "module": "commonjs",                  
    "declaration": true,
    "strict": false,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
  }
}
```

### Start application
Create index.ts file
``` typescript
import http from 'http';
import { Application } from 'tsnode-express';

const application = new Application();

application.start((express, config) => {
  http.createServer(express).listen(3000, () => {
    console.log('Server listening')
  })
})
```

##### Notice the `start` method is async
##### `start` method pass to callback express and config provider

### Compile code with ts-node
```
 ./node_modules/.bin/ts-node index.ts
```
##### You can install ts-node globally, connect nodemon or configure somehow else

### Make first request
Expected result for GET http://localhost:3000/health
```json
{
  "status": "live"
}
```

### Write the Controller
##### Note: all classes should had written before appplication.start() had called

```typescript
import { Controller, Get } from "tsnode-express";

@Controller('some')
class SomeController {
  @Get('/')
  getSuccess(args: IRequestArguments) {
    return {
      data: "success"
    }
  }
}
```

#### The "Controller" decorator accepts as argument base path to route
#### The "Get" decorator accepts as agrument additional path to route

Expected result fot the GET http://localhost:3000/some
```json
{
  "data": "success"
}
```

### Use dependency injections
The application support dependency injection mechanism

```typescript
import { Service } from "tsnode-express";

@Service()
class SomeService {
  getSomeData() {
    return {
      data: "from service"
    }
  }
}
```
#### Modify your controller

```typescript
import { Controller, Get } from "tsnode-express";

@Controller('some')
class SomeController {
  constructor(public someService: SomeService)
  @Get('/service')
  getFromService(args: IRequestArguments) {
    return this.someService.getSomeData()
  }
}
```

Expected result fot the GET http://localhost:3000/some/service
```json
{
    "data": "from service"
}
```

#### You can also inject any class wich marked as Service() not only in controllers
#### Service injected in other service wil be works too

### Use ConfigProvider as injection

Insert before applocation.start() function

```typescript
application.useConfig((config) => {
  config.test = 'test config field';
});
```
##### Notice the `useConfig` method can be async and used in chain

#### Modify your service or controller

```typescript
import { Service, ConfigProvider } from "tsnode-express";

@Service()
class SomeService {
  constructor(public configProvider: ConfigProvider) {}
  getTestConfig() {
    return {
      data: "from service",
      configField: this.configProvider.test
    }
  }
}
```

Expected result fot the GET http://localhost:3000/some/service
##### Response
```json
{
  "data": "from service",
  "configField": "test config field"
}
```

### Working with request params and request query

```typescript
import { Controller, Post } from "tsnode-express";

@Controller('some')
class SomeController {
  @Post('echo/:param')
  echo({ body, params, query }: IRequestArguments) {
    return {
      body: body.data,
      params: params.param,
      query: query.echo
    }
  }
}
```

Expected result fot the POST http://localhost:3000/some/echo/echoParam?echo=echoQuery
##### Request
```json
{
  "data": "echoBody"
}
```

##### Response
```json
{
  "body": "echoBody",
  "params": "echoParam",
  "query": "echoQuery"
}
```

### Use reuest`s Before and After hooks
#### Add hooks and route function to the controller
In afrer hook available result object wich collect data from original method
```typescript
@Before('GET', '/hooks')
beforeWithHooks(req: IRequest, res: IResponse, next: Function) {
  req.body.before = 'before hook'
}

@Get('/hooks')
withHooks(args: IRequestArguments) {
  return {
    origin: 'original method'
  }
}

@After('GET', '/hooks')
afterWithHooks(req: IRequest, res: IResponse, next: Function) {
  res.result = Object.assign(req.body, res.result, { after: 'after hook' })
}
```

Expected result fot the GET http://localhost:3000/some/hooks
##### Response
```json
{
  "before": "before hook",
  "origin": "original method",
  "after": "after hook"
}
```

Hooks are accepts in first argument method type wich you want define for hook GET, POST etc
As second argument you should pass a path to route
Hooks can works separately from original function if you don`t need it
As example you can work with webhooks and use only @Before wook to validate headers 
or do with request something else
#### Example single hooks
```typescript
 @Before('GET', '/single-before-hook/:param')
singleBeforeHook(req: IRequest, res: IResponse, next: Function) {
  res.send({ break: `Before hook catch ${req.params.param} param` })
}
```

Expected result fot the GET http://localhost:3000:3000/some/single-before-hook/someParam
##### Response
```json
{
  "break": "Before hook catch someParam param"
}
```

```typescript
@After('GET', '/single-after-hook/:param')
singleAfterHook(req: IRequest, res: IResponse, next: Function) {
  res.send({ break: `After hook catch ${req.params.param} param` })
}
```

Expected result fot the GET http://localhost:3000:3000/some/single-after-hook/someParam
##### Response
```json
{
  "break": "After hook catch someParam param"
}
```
#### Afrer hook should always close response

## AUTHORIZATION

### Application contains the powerfull authorization interface
#### Write authorization provider
Verify function should terurns the promise
```typescript
import { IAuthProvider, IAuthTarget } from "tsnode-express";

@Reflect.metadata('design', 'paramtypes')
class AuthProvider implements IAuthProvider {
  async verify(token: string, authTarget: IAuthTarget): Promise<any> {
    // veryfy token here and return the obj witch you want to see in req otions
    return { name: 'John Doe' };
  }
}
```
##### You can inject in `AuthProvider` application `ConfigProvider` or any other service
##### Any object which you returns from `verify` you can get on request handler
#### Example of `AuthTarget`
```
  AuthTarget {
    controller: 'AuthController',
    method: 'get',
    basePath: '/auth',
    path: '/me',
    functionName: 'me',
    role: 'default',
    roles: [ 'default', 'admin', 'super' ],
    fullPath: '/auth/me' }
```

Insert before applocation.start() function and define where and how you want to handle auth token

```typescript
application.useAuthorizationProvider(AuthProvider, (options: IAuthOptions) => {
  // Define token handler field or leave empty
})
```

By defalult options looks like
```
AuthOptions {
  authorizationHeader: 'authorization',
  authorizationQueryParam: 'access_token',
  authorizationBodyField: 'accessToken' }
```

#### Decorare your controller
```typescript
@Authorization()
@Controller('auth')
export class AuthController {
}
```

Rigth now any request to `/auth` will be sequre by AuthProvider `verify` handler

#### Authorization oprions
```typescript
@Authorization({ role: 'default', roles: ['admin', 'user'] })
```
`@Authorization` decorator accept role/roles otions which will be inclured to `AuthTarget` object
in `AuthProvider` `verify` handler

#### Authorization oppions in routes decorator
```typescript
@Get('me', { role: 'default' })
```
Route decorator also accept role/roles otions which will be inclured to `AuthTarget` object
in `AuthProvider` `verify` handler

```typescript
@Get('sign-in', { auth: false })
```
Also you can exclude some routes from authorization inside sequre controller
This migth be helps when controller needs to be sequre but some routes should be public
For example in case when you configure webhook with custom auth

### Enabling internal logging
logLevels might contains array as described below

 - info - logging the incoming request(path, target functions)
 - success - runs once when server starts and display sucessfuly builded routes
 - error - always print stactrace and display errors without statusCodes
 - warning - display errors which was throwed mannualy and contains the statusCodes

printStack says to application is the print stack trace required on warnings.

These options by defaulf is empty

```typescript
  application.useConfig((config) => {
    config.logLevels = ['info', 'success', 'error', 'warning'];
    config.printStack = false;
  });
```

### CORS and primary configuretion not includet to lib yet
Constructor of applications retunrs an express instance
so you can configure it before application builds

Example how to configure CORS
```typescript
const application = new Application((express) => {
  express.use((req: IRequest, res: IResponse, next: Function) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
});
```

#### Application has his own wrapper for `express.use` and can be used in chain
```typescript
const application = new Application();

application
  .use(cors())
  .use(/** another handler */)
  .use(/** another handler */)
});
```

### Error Handling
The applications uses as error lib https://www.npmjs.com/package/ts-http-errors

So applications allows to override `handleError` and `handleNotFound` methods
which uses as express middleware

```typescript
const application = new Application();
app.handleError = function (err: ExtendedError, req: IRequest, res: IResponse, next: Function) {
  //put your code here
}
```

You can choose another way and extend your own class from application
```typescript

class OwnApp extends Application {
  constructor() {
    super()
    this.express.use((req: IRequest, res: IResponse, next: Function) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      next();
    });
  }
}

const app = new OwnApp();
app.start();
```

### Building from several files and folders
As the typescript `import` is different with nodejs `require`
Application have a simple stub to keep code structural

Example: 
  - moduleA
    - service.ts
    - controller.ts
    - index.ts
  - moduleB 
    - controller.ts
    - service.ts
    - index.ts
  - index.ts

```typescript
import * as moduleA from './moduleA';
import * as moduleB from './moduleB';

const application = new Application();

application
  .registerModule(moduleA);
  .registerModule(moduleB);
```

### External Injections
Application support external injections throuth

```typescript
public inject<T>(name: string, cb: Function): Application;
public inject<T>(instance: T): Application;
```

So you can inject to application already creates instances or use factory to create incjection.
Factory can be async

Exapmple
```typescript
abstract class IInjectedService {
  stub: string
};

class InjectedService extends IInjectedService {
  stub: string
  constructor(opts) {
    super();
    Object.assign(this, opts);
  }
}

const injectedService: InjectedService = new InjectedService({ 
  stub: 'injected as class'
});

const application = new Application();

application
  .inject<InjectedService>(injectedService)
  .inject<IInjectedService>('IInjectedService', async () => ({ stub: 'injected as interface' }))
```

And after application start those can be available on services or controllers

```typescript
@Service()
class SomeService {
  constructor(
    public injectedService: InjectedService,
    public iInjectedService: IInjectedService
  ) {}
```
#### As in typescript interfaces can not be reflected I propose using empty abstract classes

### Doc is not finished yet. Please you look at the full example on github
