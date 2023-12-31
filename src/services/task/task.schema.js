import { Schema, model } from 'mongoose';
// import paginate from 'mongoose-paginate-v2';
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  // name: { type: String, required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  service: { type: ObjectId, ref: 'Service', required: true },
  customer: { type: ObjectId, ref: 'Customer', required: true },
  billable: { type: Boolean, default: true },
  duration: { minute: { type: Number, default: 0 }, second: { type: Number, default: 0 } },
  elapsedTime: [{ type: Object }],
  notes: { type: String },
  exportStatus: { type: Boolean, default: false },
  date: { type: Date, default: new Date }
}, { versionKey: false });

schema.methods.toJSON = function () {
  const obj = this.toObject();
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

// schema.plugin(paginate);

export default model('Task', schema);