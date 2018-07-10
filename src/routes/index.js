import express from 'express'
import user from './user'
import cart from './cart'
import coupon from './coupon'
import order from './order'
import { ensureLogin } from './privilege'

const router = new express.Router()

router.get('/', async (req, res) => {
  res.send({ msg: 'it is work' })
})

router.use(ensureLogin)

router.use('/user', user)
router.use('/cart', cart)
router.use('/coupon', coupon)
router.use('/order', order)

export default router
