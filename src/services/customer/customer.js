import { auth, checkRole } from '../middlewares';
import { create, getAll } from './category.entity';


export default function category() {

  /**
  * POST /category
  * @description This route is used to create a category.
  * @response {Object} 201 - the new category.
  */
  this.route.post('/category', auth, checkRole(['admin']), create(this));

  /**
  * GET /category
  * @description This route is used to create a category.
  * @response {Object} 200 - all category.
  */
  this.route.get('/category', auth, getAll(this));


}