import Service from './service.schema';
import rearrageSearch from '../../utils/rearrageSearch';

const createAllowed = new Set(['name']);
const updatedAllowed = new Set(['name']);
const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'status', 'sortBy']);

/**
 * Create a new service. only admin can create this service.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The created service object.
 */
export const create = ({ db, lyra }) => async (req, res) => {
  try {
    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => createAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    const service = await db.create({ table: Service, key: req.body });
    if (!service) return res.status(400).send('Bad Request');

    // insert product data for orama search
    await lyra.insert('service', { id: service.id, name: service.name });

    return res.status(201).send(service);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get service information.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    let service = await db.findOne({ table: Service, key: { id: req.params.id } });
    if (!service) return res.status(400).send('service not found');
    res.status(200).send(service);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get all service information.
 */
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {
    // implementing orama search
    if (req.query.search) {
      const data = await lyra.search('service', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      req.query.page = 1;
      delete req.query.search;
    }

    let services = await db.find({ table: Service, key: { paginate: req.query.paginate === 'true', allowedQuery, query: req.query } });

    // mongodb find method change the serial of lyra search data. apply sorting for lyra search and mongodb search serial same.
    if (req.query.id) services = await rearrageSearch(req.query, services);

    res.status(200).send(services);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * Update service. only admin can update this service.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated service object.
 */
export const update = ({ db, lyra }) => async (req, res) => {
  try {
    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => updatedAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    const service = await db.update({ table: Service, key: { id: req.params.id, body: req.body } });
    if (!service) return res.status(400).send('Bad Request');

    // remove previously inserted search data
    await lyra.remove('service', req.params.id);
    // insert product data for orama search
    await lyra.insert('service', {
      id: service.id,
      name: service.name,
    });

    return res.status(200).send(service);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * Delete Service. only admin can Delete this service.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} success or fail message.
 */
export const remove = ({ db, lyra }) => async (req, res) => {
  try {
    const service = await db.remove({ table: Service, key: { id: req.params.id } });
    if (!service) return res.status(404).send('service not found');

    await lyra.remove('service', req.params.id);
    res.status(200).send({ message: 'Deleted Successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
