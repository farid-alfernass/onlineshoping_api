import express from 'express'
import _ from 'lodash'
import base64 from 'base-64'
import { Order, Payment, Product, Coupon } from 'models'
import { helper, redisClient } from 'utils'

const router = new express.Router()

const CART_KEY = 'CART_'
const COUPON_KEY = 'COUPON_USER_LIST'

router.get('/', async (req, res) => {
  let { ref } = req.query

  let order = await await Order.findOne({ orderNumber: ref })

  if (!order) {
    return res.status(200).send({
      'status': 'ERROR',
      'message': `Order ${ref} not found`
    })
  }

  return res.status(200).send(order)
})

router.post('/', async (req, res) => {
  let { name, phone, email, address } = req.body
  let shipping = { name, phone, email, address }
  let orderNumber = { orderNumber: base64.encode(Date.now()) }
  let payment = {
    method: 'Bank Transfer',
    vendor: 'Bank Central Asia',
    reference: '6129305'
  }

  let cart = await helper.updateCartAsync(req.user.name)
  cart.status = 'waiting payment'
  cart = _.omit(_.assign(cart, { shipping, payment }, orderNumber), 'orderId')

  let order = new Order(cart)
  order = await order.save()

  _.forEach(order.products, async (item) => {
    let itemQuantity = await redisClient.hgetallAsync(CART_KEY + req.user.name)

    Product.findOneAndUpdate({ sku: item.sku }, {$inc: { stock: -_.toInteger(itemQuantity[item.sku]) }}, { new: true })
      .exec(function (err, result) {
        if (err) throw err

        // TODO: Do unit test for checking product stock
        if (result.stock <= 0) {
          return res.status(200).send({
            'status': 'ERROR',
            'message': `The product ${item.sku} is out of stock`
          })
        }
      })
  })

  Coupon.findOneAndUpdate({ promoCode: order.coupon.promoCode }, {$inc: { stock: -1 }})
    .exec(function (err, result) {
      if (err) throw err
    })
  redisClient.del(CART_KEY + req.user.name)
  redisClient.hdel(COUPON_KEY, req.user.name)

  return res.status(200).send(order)
})

router.post('/track', async (req, res) => {
  let { trackingNumber } = req.body
  let order = await Order.findOne({ 'shipping.trackingNumber': trackingNumber })
  if (!order) {
    return res.status(200).send({
      'status': 'ERROR',
      'message': `Your tracking number ${trackingNumber} is invalid`
    })
  }
  return res.status(200).send(_.omit(order.toJSON(), ['products', 'payment', 'coupon', 'user']))
})

router.post('/verify', async (req, res) => {
  // TODO: Check if orderNumber is valid or not
  let { orderNumber, name, vendor, reference } = req.body
  let verification = {
    order: orderNumber,
    name: name,
    vendor: vendor,
    reference: reference
  }

  let payment = new Payment(verification)
  payment = await payment.save()

  return res.status(200).send({
    'status': 'OK',
    'message': `Your payment for ${orderNumber} is being verified`
  })
})

router.get('/all', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).send({
      'status': 'ERROR',
      'message': `You are prohibited to access this url`
    })
  }
  let order = await await Order.find({})
  return res.status(200).send(order)
})

router.post('/update', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(200).send({
      'status': 'ERROR',
      'message': `You are prohibited to access this url`
    })
  }
  let { orderNumber, status, trackingNumber } = req.body
  let order = await Order.findOne({ orderNumber })

  if (!order) {
    return res.status(200).send({
      'status': 'ERROR',
      'message': `Order ${orderNumber} not found`
    })
  }

  if (status === 'confirmed') {
    order.status = status
    _.assign(order.shipping, { trackingNumber, status: 'shipped' })
  } else if (status === 'canceled') {
    order.status = status
  } else if (status === 'archieved') {
    order.status = status
    _.assign(order.shipping, { status: 'delivered' })
  } else {
    return res.status(200).send({
      'status': 'ERROR',
      'message': `Invalid status ${status}`
    })
  }

  await order.save()
  return res.status(200).send({
    'status': 'OK',
    'message': `The order's status has been set to ${status}`
  })
})

export default router
