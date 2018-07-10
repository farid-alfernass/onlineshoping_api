import express from 'express'
import sha1 from 'sha1'
import jwt from 'jsonwebtoken'
import config from '../config'

import { User } from 'models'

const router = new express.Router()

router.get('/', async (req, res) => {
  const users = await User.find()
  return res.send({ users })
})

router.post('/login', async (req, res, next) => {
  const { name, password } = req.body

  try {
    const user = await User.findOne({
      name,
      password: sha1(password)
    })
    if (user) {
      const token = jwt.sign({
        name: name,
        role: user.role
      }, config.jwtSecret)
      return res.send({
        token: token,
        user: user
      })
    }
    next({ msg: 'wrong username or password', status: 401 })
  } catch (err) {
    next(err)
  }
})

router.post('/create', async (req, res, next) => {
  const { name, password } = req.body
  try {
    let user = await User.findOne({ name })
    if (user) {
      return next({ msg: 'user already existed', status: 403 })
    }
    user = new User({
      name,
      password: sha1(password),
      role: 'user'
    })
    user = await user.save()
    return res.send(user)
  } catch (err) {
    next(err)
  }
})
export default router
