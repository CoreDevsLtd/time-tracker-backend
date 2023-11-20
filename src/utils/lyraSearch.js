/**
 * This function is used to implement search functionality.
 *
 * @param {Object} query is req.query object instance
 * @param {Object} lyra is lyra search instance
 * @param {String} schema is field name of schema where search
 * @param {Object} option is optional parameter of lyra
 */
export default async function (req, lyra, schema) {
  if (req.query.search) {
    const data = await lyra.search(schema, {
      term: req.query.search
    });
    const Ids = data.hits.map(elem => elem.id);
    req.query.id = { $in: Ids };
    delete req.query.search;
  }
}