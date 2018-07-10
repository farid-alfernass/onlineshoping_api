import mongoose from 'mongoose'

const Schema = mongoose.Schema
const OrderSchema = new Schema({
  orderId: String,
  orderNumber: String,
  status: String,
  subTotal: Number,
  grandTotal: Number,
  user: {
    _id: String,
    name: String,
    role: String
  },
  coupon: {
    _id: String,
    deal: String,
    promoCode: String,
    amount: Number
  },
  products: [{
    _id: String,
    sku: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  shipping: {
    name: String,
    phone: String,
    email: String,
    address: String,
    status: {type: String, default: null},
    trackingNumber: {type: String, default: null}
  },
  payment: {
    method: String,
    vendor: String,
    reference: String
  }
})

OrderSchema.options.toJSON = OrderSchema.options.toJSON || {}

const Order = mongoose.model('order', OrderSchema)
export default Order
