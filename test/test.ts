import { ConfigProvider } from 'tsnode-express';
import test from 'tape';
import http from 'http';
import { CoreOptions } from 'request';
import request from 'request-promise-native';
import application from '../example/server'
import {TestPlugin, PLUGIN_NAME } from "../example/simplePlugin";

const options : CoreOptions = {
  json: true
}

const url = `http://localhost:${process.env.PORT}`

test('start server', async (t) => {
  await application
      .usePlugin(TestPlugin)
      .start((express, configProvider) => {
          // console.log(application.Injector)
          http.createServer(express).listen(configProvider.port, () =>
              t.end())
      }
    );
})

test('plugin should be available', (t) =>{
    const plugin = application.Injector.getPlugin(PLUGIN_NAME);
    t.ok(plugin, 'Plugin should be defined');
    t.end();
});

test('plugin decorators should work', (t)=> {
    const plugin = application.Injector.getPlugin(PLUGIN_NAME);
    t.deepEqual(plugin.data, ['getSuccess', 'withHooks'] , 'Should be [\'getSuccess\', \'withHooks\']');
    t.end();
});

test('plugin instance should works', (t)=> {
    const pluginInstance = application.Injector.resolve<TestPlugin>(PLUGIN_NAME);
    const testParams = {test: 'testData'};
    pluginInstance.setParams(testParams);
    t.deepEqual(pluginInstance.params, testParams, 'Params should be equal');
    t.end();
});

test('plugin injections should work', (t)=> {
    const pluginInstance = application.Injector.resolve<TestPlugin>(PLUGIN_NAME);
    t.deepEqual(pluginInstance.getConfig('test'), 'test config field', 'Config should be equal');
    t.end();
});

test('server should be live', async (t) => {
  try {
    const { status } = await request.get(`${url}/health`, options);
    t.equal(status, 'live', 'status should be live');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('server should return 404', async (t) => {
  const expected  = {
    status: 404,
    message: 'Route /incorrect was not found',
    name: 'NotFoundError'
  };
  try {
    await request.get(`${url}/incorrect`, options);
  }
  catch({ error }) {
    t.ok(error);
    t.deepEqual(error, expected, 'Should be Not Found Error')
  }
  finally { t.end(); }
})

test('server should get success', async (t) => {
  try {
    const { data } = await request.get(`${url}/some`, options);
    t.equal(data, 'success', 'data should be success');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('server should return data from service', async (t) => {
  try {
    const { data } = await request.get(`${url}/some/service`, options);
    t.equal(data, 'from service', 'data sould be from service');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('server should return data from service with config field', async (t) => {
  try {
    const { configField } = await request.get(`${url}/some/service`, options);
    t.equal(configField, 'test config field', 'data sould be from config provider');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('server should return echo', async (t) => {
  const expected = {
    body: 'echoBody',
    params: 'echoParam',
    query: 'echoQuery'
  };
  const form = { 
    data: 'echoBody'
  };
  try {
    const response = await request.post(`${url}/some/echo/echoParam?echo=echoQuery`,
                                         Object.assign({}, options, { form }));
    t.deepEqual(response, expected, 'should collect expected echo fields');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Hooks should works', async (t) => {
  const expected = {
    before: 'before hook',
    origin: 'original method',
    after: 'after hook'
  };
  try {
    const response = await request.get(`${url}/some/hooks`, options);
    t.deepEqual(response, expected, 'should collect expected hook fields');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Single before hook should works', async (t) => {
  const expected = {
    break: 'Before hook catch someParam param',
  };
  try {
    const response = await request.get(`${url}/some/single-before-hook/someParam`, options);
    t.deepEqual(response, expected, 'should collect expected before hook fields');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Single after hook should works', async (t) => {
  const expected = {
    break: 'After hook catch someParam param',
  };
  try {
    const response = await request.get(`${url}/some/single-after-hook/someParam`, options);
    t.deepEqual(response, expected, 'should collect expected after hook fields');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Should return unauthorized', async (t) => {
  const expected = {
    status: 401,
    message: 'Unauthorized',
    name: 'UnauthorizedError'
  }
  try {
    await request.post(`${url}/auth`, options);
  }
  catch({ error }) {
    t.ok(error);
    t.deepEqual(error, expected, 'Should be Authorization Error')
  }
  finally { t.end(); }
})

test('Should return auth token for John Doe', async (t) => {
  try {
    const { token } = await request.get(`${url}/auth/sign-in?name=John Doe&password=qwerty9`, options);
    t.ok(token, 'should exist token');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Should return auth token for Jane Doe', async (t) => {
  try {
    const { token } = await request.get(`${url}/auth/sign-in?name=Jane Doe&password=qwerty8`, options);
    t.ok(token, 'should exist token');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Should add new user with John Doe token', async (t) => {
  const expected = {
    name: 'JohnDoe\'sUser',
    role: 'default',
  }
  try {
    const { token } = await request.get(`${url}/auth/sign-in?name=John Doe&password=qwerty9`, options);
    const headers = {
      'authorization': token
    }
    const { success } = await request.post(`${url}/auth?name=JohnDoe'sUser&password=test&role=default`,
                                            Object.assign({}, options, { headers }));

    const data = await request.get(`${url}/auth/JohnDoe'sUser`, Object.assign({}, options, { headers }))
    t.ok(token, 'should exist token');
    t.true(success, 'success add user')
    t.deepEqual(data, expected, 'Should get JohnDoe`sUser')
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Should return Jane`s Doe user on /me', async (t) => {
  const expected = {
    name: 'JaneDoe\'sUser',
    role: 'default',
  }
  try {
    const { token } = await request.get(`${url}/auth/sign-in?name=Jane Doe&password=qwerty8`, options);
    const headers = {
      'authorization': token
    }
    const { success } = await request.post(`${url}/auth?name=JaneDoe'sUser&password=test&role=default`,
                                            Object.assign({}, options, { headers }));

    const data = await request.get(`${url}/auth/sign-in?name=JaneDoe'sUser&password=test`, options);
    headers['authorization'] = data.token
    const user = await request.get(`${url}/auth/me`, Object.assign({}, options, { headers }));
    t.ok(token, 'should exist token');
    t.true(success, 'success add user')
    t.deepEqual(user, expected, 'Should get JaneDoe`sUser')
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Should return Forbidden Error', async (t) => {
  const expected = {
    status: 403,
    message: 'Forbidden access for /auth/:name',
    name: 'ForbiddenError'
  }
  try {
    const { token } = await request.get(`${url}/auth/sign-in?name=Jane Doe&password=qwerty8`, options);
    const headers = {
      'authorization': token
    }
    await request.post(`${url}/auth?name=test&password=test&role=test`,
                                            Object.assign({}, options, { headers }));

    const data = await request.get(`${url}/auth/sign-in?name=test&password=test`, options);
    headers['authorization'] = data.token
    await request.get(`${url}/auth/Jane Doe`, Object.assign({}, options, { headers }));
  }
  catch({ error }) {
    t.ok(error);
    t.deepEqual(error, expected, 'Should be Forbidden Error')
  }
  finally { t.end(); }
})

test('Should return list users', async (t) => {
  const expected = [
    { name: 'John Doe', role: 'super' },
    { name: 'Jane Doe', role: 'admin' },
    { name: 'JohnDoe\'sUser', role: 'default' },
    { name: 'JaneDoe\'sUser', role: 'default' },
    { name: 'test', role: 'test' }
  ]
  try {
    const { token } = await request.get(`${url}/auth/sign-in?name=Jane Doe&password=qwerty8`, options);
    const headers = {
      'authorization': token
    }
    const data = await request.get(`${url}/auth`, Object.assign({}, options, { headers }));

    t.ok(token, 'should exist token');
    t.deepEqual(data, expected, 'Should get users')
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('should catch custom error', async (t) => {
  const expected = {
    name: "BadRequestError",
    status: 400,
    message: "custom error"
  };
  try {
    await request.get(`${url}/some/custom-error`, options);
  }
  catch({ error }) { t.deepEqual(error, expected, 'catch custom error'); }
  finally { t.end(); }
})

test('should catch internal error', async (t) => {
  const expected = {
    name: 'InternalServerError',
    status: 500,
    message: 'Cannot read property \'charCodeAt\' of undefined'
  };
  try {
    await request.get(`${url}/some/internal-error`, options);
  }
  catch({ error }) { t.deepEqual(error, expected, 'catch internal error'); }
  finally { t.end(); }
})

test('should return correct data from injected services without decorators', async (t) => {
  const expected = {
    injectedService: 'injected as class',
    iInjectedService: 'injected as interface'
  };
  try {
    const data = await request.get(`${url}/some/from-external-service`, options);
    t.deepEqual(data, expected, 'Should external data');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('exit tests', (t) => {
  t.end();
  process.exit(0);
})
