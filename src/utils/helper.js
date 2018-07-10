import async from 'async'
import Promise from 'bluebird'
import _ from 'lodash'
import redis from './redis'
import { User, Product, Coupon } from 'models'

const CART_KEY = 'CART_'
const COUPON_KEY = 'COUPON_USER_LIST'

const redisClient = redis.client

async function updateCart (username, callback) {
  let grandTotal = 0
  let subTotal = 0
  let cartItems = []
  let coupon = null

  let cart = await redisClient.hgetallAsync(CART_KEY + username)
  let promoCode = await redisClient.hgetAsync(COUPON_KEY, username)
  let user = await User.findOne({ name: username })

  async.forEachOf(cart, async (value, prop, callback) => {
    let product = await Product.findOne({ sku: prop })
    grandTotal = subTotal += product.price * _.toInteger(value)
    cartItems.push(_.assign(_.omit(product.toJSON(), 'stock'), { quantity: value }))
    callback()
  }, async (err) => {
    if (err) callback(new Error('Product not found'))
    if (!err && promoCode) {
      coupon = await Coupon.findOne({ promoCode })
      coupon = _.omit(coupon.toJSON(), 'quantity')
      let discount = _.toInteger(coupon.amount) / 100 * subTotal
      grandTotal = subTotal - discount
    }

    let response = {
      'orderId': CART_KEY + username,
      'user': user,
      'status': 'incart',
      'subTotal': subTotal,
      'coupon': coupon,
      'grandTotal': grandTotal,
      'products': cartItems
    }

    callback(null, response)
  })
}

const updateCartAsync = Promise.promisify(updateCart)

export default { updateCartAsync }
