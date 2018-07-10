import expressJwt from 'express-jwt'
import config from '../config'

export const ensureLogin = expressJwt({ secret: config.jwtSecret }).unless({path: ['/user/create', '/user/login']})
