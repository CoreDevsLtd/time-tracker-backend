import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
  name: { type: String, required: true },
}, { timestamps: true, versionKey: false });

schema.methods.toJSON = function () {
  const obj = this.toObject();
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

schema.plugin(paginate);

export default model('Service', schema);