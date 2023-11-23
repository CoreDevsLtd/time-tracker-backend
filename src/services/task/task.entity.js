import Task from './task.schema';
// import rearrageSearch from '../../utils/rearrageSearch';

const createAllowed = new Set(['name', 'user', 'service', 'customer', 'duration', 'billable', 'elapsedTime', 'notes', 'exportStatus', 'date']);
const updatedAllowed = new Set(['name', 'service', 'customer', 'duration', 'billable', 'elapsedTime', 'notes', 'exportStatus', 'date', 'activeTime', 'user']);
const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'status', 'sortBy', 'date', 'user']);
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

/**
 * Create a new task. only admin can create this task.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The created task object.
 */
export const create = ({ db }) => async (req, res) => {
  try {
    req.body = req.body?.data ? JSON.parse(req.body?.data) : req.body;
    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => createAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    const task = await db.create({ table: Task, key: { ...req.body, populate: { path: 'user service customer', select: 'fullName fName lName name' } } });
    if (!task) return res.status(400).send('Bad Request');

    return res.status(201).send(task);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get task information.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    let task = await db.findOne({ table: Task, key: { id: req.params.id, populate: { path: 'user service customer', select: 'fullName fName lName name' } } });
    if (!task) return res.status(400).send('Task not found');
    res.status(200).send(task);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get all task information.
 */
export const getAll = ({ db }) => async (req, res) => {
  try {
    const isValid = Object.keys(req.query).every(key => allowedQuery.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    if (req.user.role !== 'admin') req.query.user = ObjectId(req.user.id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    req.query.paginate = req.query.paginate || true;

    const match = {};
    const pipeline = [];

    if (req.query.date) {
      const date = JSON.parse(req.query.date);
      let data = {};
      data.$gte = new Date(date.$gte);
      date.$lte ? data.$lte = new Date(date.$lte) : '';
      match.date = data;
    }

    pipeline.push({ $match: match });

    const raw = [
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user', pipeline: [ { $project: { fName: 1, lName: 1 } }] } },
      { $unwind: '$user' },
      { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer', pipeline: [{ $project: { name: 1 } }] } },
      { $unwind: '$customer' },
      { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'service', pipeline: [{ $project: { name: 1 } }] } },
      { $unwind: '$service' }
    ];

    pipeline.push(...raw);

    if (req.query.sortBy) {
      const [field, order] = req.query.sortBy.split(':');
      pipeline.push({ $sort: { [field]: order === 'desc' ? -1 : 1 }});
    }

    if (req.query.paginate !== 'false') {
      const query = [
        { $skip: page - 1 },
        { $limit: limit }
      ];
      pipeline.push(...query);
    }

    const tasks = await db.aggr({ table: Task, key: pipeline });
    const totalDocs = await db.countDocs({ table: Task, key: match });

    const result = req.query.paginate === 'false' ? tasks : {
      docs: tasks,
      totalDocs,
      page,
      limit,
    };
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

// export const getAll = ({ db }) => async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') req.query.user = req.user.id;
//     let tasks = await db.find({
//       table: Task,
//       key: {
//         paginate: req.query.paginate !== 'false',
//         allowedQuery,
//         query: { ...req.query },
//         populate: {
//           path: 'user service customer',
//           select: 'fullName fName lName name',
//           option: { sort: { fName: -1 } }
//         }
//       }
//     });

//     res.status(200).send(tasks);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send('Something went wrong');
//   }
// };

/**
 * Update task. only admin can update this task.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated task object.
 */
export const update = ({ db }) => async (req, res) => {
  try {
    req.body = req.body?.data ? JSON.parse(req.body?.data) : req.body;
    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => updatedAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    const task = await db.findOne({ table: Task, key: { id: req.params.id, populate: { path: 'user service customer', select: 'fullName fName lName name' } } });
    if (!task) return res.status(400).send('Task not found');

    // update time property if use provide time property.
    // if (req.body.activeTime) {
    //   let { type } = req.body.activeTime;

    //   let lastIndex = task.elapsedTime.length - 1;
    //   let activeTime = task.elapsedTime[lastIndex];
    //   let currentSecond = new Date().getTime();

    //   if (task.elapsedTime.length > 0) {

    //     if (activeTime?.start === undefined || activeTime?.end === undefined) {
    //       activeTime[type] = currentSecond;
    //       task.elapsedTime[lastIndex] = activeTime;
    //     } else {
    //       task.elapsedTime.push({ [type]: currentSecond });
    //     }

    //     delete req.body.activeTime;
    //   } else {
    //     task.elapsedTime.push({ [type]: currentSecond });
    //   }
    // }

    if (req.body.activeTime) {
      let { start, end } = req.body.activeTime;
      task.elapsedTime.push({ start, end });
    }

    Object.keys(req.body || {}).forEach(key => task[key] = req.body[key]);
    await task.save();

    return res.status(200).send(task);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * Delete task. only admin can Delete this task.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} success or fail message.
 */
export const remove = ({ db }) => async (req, res) => {
  try {
    const task = await db.remove({ table: Task, key: { id: req.params.id } });
    if (!task) return res.status(404).send('Task not found');

    res.status(200).send({ message: 'Deleted Successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
