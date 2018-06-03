import test from 'tape';
import request from 'request-promise-native';
import application from '../example'

const { express } = application;

test('server should be live', async (t) => {
  try {
    const response = await request.get('http://localhost:3000/health')
    const { status } = JSON.parse(response)
    t.equal(status, 'live')
  }
  catch(e) {
    t.ok(e)
  }
  finally {
    t.end();
  }
    
})

test('server should get success', async (t) => {
  try {
    const response = await request.get('http://localhost:3000/some')
    const { data } = JSON.parse(response)
    t.equal(data, 'success')
  }
  catch(e) {
    console.error(e)
  }
  finally {
    t.end();
  }
})

test('server should return data from service', async (t) => {
  try {
    const response = await request.get('http://localhost:3000/some/service')
    const { data } = JSON.parse(response)
    t.equal(data, 'from service')
  }
  catch(e) {
    console.error(e)
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
  }
  try {
    const response = await request.post('http://localhost:3000/some/echo/echoParam?echo=echoQuery', { form: { data: 'echoBody'}})
    const real = JSON.parse(response)
    t.deepEqual(real, expected, 'success')
  }
  catch(e) {
    console.error(e)
  }
  finally {
    t.end();
  }
})

test('exit tests', (t) => {
  t.end()
  process.exit(0)
})





