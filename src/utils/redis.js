import redis from 'redis'
import config from '../config'
import Promise from 'bluebird'

const client = Promise.promisifyAll(redis.createClient(config.redis))

client.on('connect', function (err) {
  if (err) console.log('An error occured ' + err)
  // console.log('Client has connected to Redis')
})

client.on('error', function (err) {
  console.log('An error occured ' + err)
})

export default { client }
