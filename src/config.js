const env = process.env.NODE_ENV
const common = {
  port: 3000,
  jwtSecret: 'pGDJVfaam11d94RT2sZyKxWw0YyPeQxJ'
}
const config = {
  development: {
    mongodb: {
      host: '127.0.0.1',
      database: 'cart'
    },
    redis: {
      host: '127.0.0.1',
      port: '6379'
    }
  },
  production: {
    mongodb: {
      host: '127.0.0.1',
      database: 'cart'
    },
    redis: {
      host: '127.0.0.1',
      port: '6379'
    }
  }
}
export default Object.assign(common, config[env])
