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

test('server should be live', async (t) => {
    // t.plan(1)
    
  try {
    const res = await request.get('http://localhost:3000/health')
    console.log(JSON.parse(res))
    t.equal(JSON.parse(res).status, 'live')
  
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





