import Task from './task.schema';
// import rearrageSearch from '../../utils/rearrageSearch';

const createAllowed = new Set(['name', 'user', 'service', 'customer', 'duration', 'billable', 'elapsedTime', 'notes', 'exportStatus', 'date']);
const updatedAllowed = new Set(['name', 'service', 'customer', 'duration', 'billable', 'elapsedTime', 'notes', 'exportStatus', 'date', 'activeTime', 'user']);
const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'status', 'sortBy', 'date']);

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
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {
    // implementing orama search
    if (req.query.search) {
      const data = await lyra.search('task', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      req.query.page = 1;
      delete req.query.search;
    }

    let tasks = await db.find({ table: Task, key: { paginate: req.query.paginate !== 'false', allowedQuery, query: { ...req.query }, populate: { path: 'user service customer', select: 'fullName fName lName name' } } });

    res.status(200).send(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

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
    if (req.body.activeTime) {
      let { type, time } = req.body.activeTime;

      let lastIndex = task.elapsedTime.length - 1;
      let activeTime = task.elapsedTime[lastIndex];

      if (task.elapsedTime.length > 0) {

        if (activeTime?.start === undefined || activeTime?.end === undefined) {
          activeTime[type] = time;
          task.elapsedTime[lastIndex] = activeTime;
        } else {
          task.elapsedTime.push({ [type]: time });
        }

        delete req.body.activeTime;
      } else {
        task.elapsedTime.push({ [type]: time });
      }
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
