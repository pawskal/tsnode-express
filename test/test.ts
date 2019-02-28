import test from 'tape';
import { CoreOptions } from 'request';
import request from 'request-promise-native';
import application from '../example'
import { BadRequestError } from 'ts-http-errors';

const { express } = application;

const options : CoreOptions = {
  json: true
}

test('server should be live', async (t) => {
  try {
    const { status } = await request.get('http://localhost:3000/health', options);
    t.equal(status, 'live', 'status should be live');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('server should return 404', async (t) => {
  const expected  = {
    status: 404,
    message: 'Not Found',
    name: 'NotFoundError'
  };
  try {
    await request.get('http://localhost:3000/incorrect', options);
  }
  catch({ error }) {
    t.ok(error);
    t.deepEqual(error, expected, 'Should be Not Found Error')
  }
  finally { t.end(); }
})

test('server should get success', async (t) => {
  try {
    const { data } = await request.get('http://localhost:3000/some', options);
    t.equal(data, 'success', 'data should be success');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('server should return data from service', async (t) => {
  try {
    const { data } = await request.get('http://localhost:3000/some/service', options);
    t.equal(data, 'from service', 'data sould be from service');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('server should return data from service with config field', async (t) => {
  try {
    const { configField } = await request.get('http://localhost:3000/some/service', options);
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
    const response = await request.post('http://localhost:3000/some/echo/echoParam?echo=echoQuery',
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
    const response = await request.get('http://localhost:3000/some/hooks', options);
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
    const response = await request.get('http://localhost:3000/some/single-before-hook/someParam', options);
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
    const response = await request.get('http://localhost:3000/some/single-after-hook/someParam', options);
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
    await request.post('http://localhost:3000/auth', options);
  }
  catch({ error }) {
    t.ok(error);
    t.deepEqual(error, expected, 'Should be Authorization Error')
  }
  finally { t.end(); }
})

test('Should return auth token for John Doe', async (t) => {
  try {
    const { token } = await request.get('http://localhost:3000/auth/sign-in?name=John Doe&password=qwerty9', options);
    t.ok(token, 'should exist token');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Should return auth token for Jane Doe', async (t) => {
  try {
    const { token } = await request.get('http://localhost:3000/auth/sign-in?name=Jane Doe&password=qwerty8', options);
    t.ok(token, 'should exist token');
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Should add new user with John Doe token', async (t) => {
  const expected = {
    name: 'JohnDoe`sUser',
    role: 'default',
  }
  try {
    const { token } = await request.get('http://localhost:3000/auth/sign-in?name=John Doe&password=qwerty9', options);
    const headers = {
      'authorization': token
    }
    const { success } = await request.post('http://localhost:3000/auth?name=JohnDoe`sUser&password=test&role=default',
                                            Object.assign({}, options, { headers }));

    const data = await request.get('http://localhost:3000/auth/JohnDoe`sUser', Object.assign({}, options, { headers }))
    t.ok(token, 'should exist token');
    t.true(success, 'success add user')
    t.deepEqual(data, expected, 'Should get JohnDoe`sUser')
  }
  catch(e) { t.ifErr(e); }
  finally { t.end(); }
})

test('Should return Jane`s Doe user on /me', async (t) => {
  const expected = {
    name: 'JaneDoe`sUser',
    role: 'default',
  }
  try {
    const { token } = await request.get('http://localhost:3000/auth/sign-in?name=Jane Doe&password=qwerty8', options);
    const headers = {
      'authorization': token
    }
    const { success } = await request.post('http://localhost:3000/auth?name=JaneDoe`sUser&password=test&role=default',
                                            Object.assign({}, options, { headers }));

    const data = await request.get('http://localhost:3000/auth/sign-in?name=JaneDoe`sUser&password=test', options);
    headers['authorization'] = data.token
    const user = await request.get('http://localhost:3000/auth/me', Object.assign({}, options, { headers }));
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
    const { token } = await request.get('http://localhost:3000/auth/sign-in?name=Jane Doe&password=qwerty8', options);
    const headers = {
      'authorization': token
    }
    await request.post('http://localhost:3000/auth?name=test&password=test&role=test',
                                            Object.assign({}, options, { headers }));

    const data = await request.get('http://localhost:3000/auth/sign-in?name=test&password=test', options);
    headers['authorization'] = data.token
    await request.get('http://localhost:3000/auth/Jane Doe', Object.assign({}, options, { headers }));
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
    { name: 'JohnDoe`sUser', role: 'default' },
    { name: 'JaneDoe`sUser', role: 'default' },
    { name: 'test', role: 'test' }
  ]
  try {
    const { token } = await request.get('http://localhost:3000/auth/sign-in?name=Jane Doe&password=qwerty8', options);
    const headers = {
      'authorization': token
    }
    const data = await request.get('http://localhost:3000/auth',
                                            Object.assign({}, options, { headers }));

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
    await request.get('http://localhost:3000/some/custom-error', options);
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
    await request.get('http://localhost:3000/some/internal-error', options);
  }
  catch({ error }) { t.deepEqual(error, expected, 'catch internal error'); }
  finally { t.end(); }
})

test('exit tests', (t) => {
  t.end();
  process.exit(0);
})
