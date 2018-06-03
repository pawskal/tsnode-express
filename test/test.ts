import test from 'tape';
import { CoreOptions } from 'request';
import request from 'request-promise-native';
import application from '../example'

const { express } = application;

const options : CoreOptions = {
  json: true
}

test('server should be live', async (t) => {
  try {
    const { status } = await request.get('http://localhost:3000/health', options);
    t.equal(status, 'live', 'status should be live');
  }
  catch(e) {
    t.ifErr(e);
  }
  finally {
    t.end();
  }
})

test('server should return 404', async (t) => {
  const expected  = {
    statusCode: 404,
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
  finally {
    t.end();
  }
})

test('server should get success', async (t) => {
  try {
    const { data } = await request.get('http://localhost:3000/some', options);
    t.equal(data, 'success', 'data should be success');
  }
  catch(e) {
    t.ifErr(e);
  }
  finally {
    t.end();
  }
})

test('server should return data from service', async (t) => {
  try {
    const { data } = await request.get('http://localhost:3000/some/service', options);
    t.equal(data, 'from service', 'data sould be from service');
  }
  catch(e) {
    t.ifErr(e);
  }
  finally {
    t.end();
  }
})

test('server should return data from service with config field', async (t) => {
  try {
    const { configField } = await request.get('http://localhost:3000/some/service', options);
    t.equal(configField, 'test config field', 'data sould be from config provider');
  }
  catch(e) {
    t.ifErr(e);
  }
  finally {
    t.end();
  }
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
  catch(e) {
    t.ifErr(e);
  }
  finally {
    t.end();
  }
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
  catch(e) {
    t.ifErr(e);
  }
  finally {
    t.end();
  }
})

test('Single before hook should works', async (t) => {
  const expected = {
    break: 'Before hook catch someParam param',
  };
  try {
    const response = await request.get('http://localhost:3000/some/single-before-hook/someParam', options);
    t.deepEqual(response, expected, 'should collect expected before hook fields');
  }
  catch(e) {
    t.ifErr(e);
  }
  finally {
    t.end();
  }
})

test('Single after hook should works', async (t) => {
  const expected = {
    break: 'After hook catch someParam param',
  };
  try {
    const response = await request.get('http://localhost:3000/some/single-after-hook/someParam', options);
    t.deepEqual(response, expected, 'should collect expected after hook fields');
  }
  catch(e) {
    t.ifErr(e);
  }
  finally {
    t.end();
  }
})

test('exit tests', (t) => {
  t.end();
  process.exit(0);
})
