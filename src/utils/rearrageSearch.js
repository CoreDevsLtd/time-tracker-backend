/**
 * This function is used to sorting result data based on lyra search. after lyra search id when i find in mongodb they change the serial. so we need to lyra search and mongodb find must be same order. thats why we apply a sorting based on lyra search search result serial.
 *
 * @param {Object} query is req.query object instance.
 * @param {Object} reuslt is mongodb find result.
 */
export default async function (query, results) {
  try {
    const Ids = Object.values(query.id)[0];

    const indexMap = {};
    Ids.forEach((value, index) => {
      indexMap[value] = index;
    });
    let docs = query.paginate !== 'true' ? results : results.docs;

    // Sort result based on the indices of Ids
    docs.sort((a, b) => indexMap[a.id] - indexMap[b.id]);
    return results;
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
}