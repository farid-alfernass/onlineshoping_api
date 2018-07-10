import mongoose from 'mongoose'

const Schema = mongoose.Schema
const PaymentSchema = new Schema({
  order: String,
  name: String,
  vendor: String,
  reference: String
})

PaymentSchema.options.toJSON = PaymentSchema.options.toJSON || {}

const Payment = mongoose.model('payment', PaymentSchema)
export default Payment
