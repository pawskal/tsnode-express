## README

### Download package
```
npm install tsnode-express --save
```

### Start application

``` typescript
import http from 'http';
import { Application } from 'tsnode-express';

const app = new Application()

application.start((express) => {
  http.createServer(express).listen(3000, () => {
    console.log('Server listening')
  })
})
```

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

## AUTHORIZATION

### Application contains the powerfull authorization interface
#### Write authorization provider

```typescript
import { IAuthMiddleware, IVerifyResponse, IAuthTarget } from "tsnode-express";
import { ConfigProvider } from "tsnode-express";

@Reflect.metadata('design', 'paramtypes')
class AuthProvider implements IAuthMiddleware {
  verify(data: any, authTarget: IAuthTarget): IVerifyResponse {
    return {
      success: data.name == 'JDoe',
      data
    };
  }
}
```

Insert before applocation.start() function

```typescript
application.useAuthorizationProvider(AuthProvider, (options: IAuthOptions) => {
  console.log(options)
  options.secret = 'SUPER PUPES SECRET';
})
```