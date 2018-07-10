import express from 'express'
import { Coupon } from 'models'
import { redisClient } from 'utils'

const router = new express.Router()

const COUPON_KEY = 'COUPON_USER_LIST'

router.post('/', async (req, res) => {
  let { promoCode } = req.body
  let counter = await redisClient.hgetAsync(COUPON_KEY, req.user.name)

  if (counter) {
    return res.status(200).send({
      'status': 'ERROR',
      'message': `You already use ${counter} promo code`
    })
  }

  let discount = await redisClient.hgetallAsync(promoCode)
  if (!discount) discount = await Coupon.findOne({ promoCode })

  if (discount) {
    redisClient.hset(COUPON_KEY, req.user.name, promoCode)

    return res.status(200).send({
      'status': 'OK',
      'message': `Your ${promoCode} promo code has been applied`
    })
  } else {
    return res.status(200).send({
      'status': 'ERROR',
      'message': `Invalid promo code ${promoCode}`
    })
  }
})

router.delete('/', (req, res) => {
  let { promoCode } = req.body
  redisClient.hdel(COUPON_KEY, req.user.name)
  return res.status(200).send({
    'status': 'OK',
    'message': `Your ${promoCode} has been deleted`
  })
})

export default router
