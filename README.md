## README

### Start application

``` typescript
import http from 'http';
import Application from '../lib/application';

const app = new Application()

application.start((express) => {
  http.createServer(express).listen(3000, () => {
    console.log('Server listening')
  })
})
```

### Write the controller
```typescript
import { Controller, Get } from "../../../lib";

@Controller('some')
export class UserController {
  
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

Expected result fot the GET http://localhost/some
```json
{
    "data": "success"
}
```

### Use dependency injections
The application support dependency injection mechanism

```typescript
import { Service } from "../../../lib";

@Service()
exrort class SomeService {
  getSomeData() {
    return {
        data: "from service"
    }
  }
}

export { SomeService }
```
#### Modify your controller

```typescript
import { Controller, Get } from "../../../lib";

@Controller('some')
export class UserController {
  constructor(public someService: SomeService)
  @Get('/service')
  getFromService(args: IRequestArguments) {
    return this.someService.getSomeData()
  }
}
```

Expected result fot the GET http://localhost/some/service
```json
{
    "data": "from service"
}
```

#### You can also inject any class wich marked as Service() not only in controllers
#### Service injected in other service wil be works too

### Working with request params and request query

```typescript
import { Controller, Get } from "../../../lib";

@Controller('some')
export class UserController {
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

Expected result fot the POST http://localhost/some/echo/echoParam?echo=echoQuery
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

### Use ConfigProvider as infection

Insert before applocation.start() function

```typescript
application.useConfig((config) => {
  config.test = 'test config field';
});
```

#### Modify your service or controller

```typescript
@Service()
export class SomeService {
  constructor(public configProvider: ConfigProvider) {}
  getTestConfig() {
    return {
        data: "from service",
        configField: this.configProvider.test
    }
  }
}
```

Expected result fot the GET http://localhost/some/service
##### Response
```json
{
    "data": "from service",
    "configField": "test config field"
}
```

