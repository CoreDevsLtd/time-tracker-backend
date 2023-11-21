import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  contact: { type: String },
  status: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

schema.plugin(paginate);
schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.fullName = `${obj.fName} ${obj.lName}`;
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

export default model('User', schema);