import mongoose from 'mongoose'

const Schema = mongoose.Schema
const UserSchema = new Schema({
  name: String,
  password: String,
  role: String
})

UserSchema.options.toJSON = UserSchema.options.toJSON || {}
UserSchema.options.toJSON.transform = (doc, ret) => {
  delete ret.password
  return ret
}

const User = mongoose.model('user', UserSchema)

export default User
