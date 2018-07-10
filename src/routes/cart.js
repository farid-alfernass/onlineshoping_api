import express from 'express'
import _ from 'lodash'
import { helper, redisClient } from 'utils'

const router = new express.Router()

const CART_KEY = 'CART_'

router.get('/', async (req, res) => {
  let cart = await helper.updateCartAsync(req.user.name)
  return res.status(200).send(cart)
})

router.post('/', async (req, res) => {
  let { productId, quantity } = req.body
  if (!quantity) quantity = 1

  redisClient.hmset(CART_KEY + req.user.name, productId, quantity)
  return res.status(200).send({
    'status': 'OK',
    'message': `Product ${productId} has been added to cart`
  })
})

router.patch('/', async (req, res) => {
  let { productId, quantity } = req.body
  if (!quantity) quantity = 1

  let result = await redisClient.hgetallAsync(CART_KEY + req.user.name)

  if (_.has(result, productId)) {
    redisClient.hincrby(CART_KEY + req.user.name, productId, quantity, (err, res) => {
      if (!err && (_.toInteger(result[productId]) + _.toInteger(quantity) <= 0)) {
        redisClient.hdel(CART_KEY + req.user.name, productId)
      }
    })
  } else {
    redisClient.hmset(CART_KEY + req.user.name, productId, quantity)
  }

  return res.status(200).send({
    'status': 'OK',
    'message': `Product ${productId} has been added to cart`
  })
})

router.delete('/', (req, res) => {
  let { productId } = req.body
  redisClient.hdel(CART_KEY + req.user.name, productId, async (err, result) => {
    if (!err && result) {
      return res.status(200).send({
        'status': 'OK',
        'message': `Product ${productId} has been removed from cart`
      })
    } else {
      return res.status(200).send({
        'status': 'ERROR',
        'message': `Product ${productId} was not found in cart`
      })
    }
  })
})

export default router
