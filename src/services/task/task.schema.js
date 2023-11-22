import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { formatTime } from './task.function';
const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
  // name: { type: String, required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  service: { type: ObjectId, ref: 'Service', required: true },
  customer: { type: ObjectId, ref: 'Customer', required: true },
  billable: { type: Boolean, default: true },
  duration: { minute: { type: Number }, second: { type: Number } },
  elapsedTime: [{ start: { type: Number } }, { end: { type: Number } }],
  notes: { type: String },
  exportStatus: { type: Boolean, default: false },
  date: { type: Date, default: new Date }
}, { timestamps: true, versionKey: false });

schema.methods.toJSON = function () {
  const obj = this.toObject();
  // obj.duration = formatTime(obj.duration);
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

schema.plugin(paginate);

export default model('Task', schema);