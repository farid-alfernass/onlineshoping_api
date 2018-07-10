import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ProductSchema = new Schema({
  sku: String,
  name: String,
  price: Number,
  stock: Number
})

ProductSchema.options.toJSON = ProductSchema.options.toJSON || {}

const Product = mongoose.model('product', ProductSchema)
export default Product
