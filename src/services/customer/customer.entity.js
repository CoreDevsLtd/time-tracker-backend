import rearrageSearch from '../../utils/rearrageSearch';
import Customer from './customer.schema';

const createAllowed = new Set(['name']);
const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'sortBy']);
/**
 * Create new customer under a store
 *
 * @param {Object} req - The request object containing the properties of customer.
 * @param {Object} db - The database object for interacting with the database.
 * @return {Object} - return the created customer object.
 */
export const create = ({ db, lyra }) => async (req, res) => {
  try {
    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => createAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    const customer = await db.create({ table: Customer, key: req.body });
    if (!customer) return res.status(400).send('Bad Request');

    console.log('customer ', customer.id);
    // add product to lyra search
    await lyra.insert('customer', { id: customer.id, name: customer.name });

    return res.status(201).send(customer);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * get all customer from a store
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @return {Object} - The result object containing all customer from a store.
 */
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {
    // implementing orama search
    if (req.query.search) {
      const data = await lyra.search('customer', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      req.query.page = 1;
      delete req.query.search;
    }

    let customer = await db.find({ table: Customer, key: { allowedQuery, paginate: req.query.paginate === 'true', query: { ...req.query } } });

    // mongodb find method change the serial of lyra search data. apply sorting for lyra search and mongodb search serial same.
    if (req.query.id) customer = await rearrageSearch(req.query, customer);

    res.status(200).send(customer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};
