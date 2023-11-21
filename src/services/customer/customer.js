import { auth, checkRole } from '../middlewares';
import { create, getAll } from './customer.entity';


export default function customer() {

  /**
  * POST /customer
  * @description This route is used to create a customer.
  * @response {Object} 201 - the new customer.
  */
  this.route.post('/customer', auth, checkRole(['admin']), create(this));

  /**
  * GET /customer
  * @description This route is used to create a customer.
  * @response {Object} 200 - all customer.
  */
  this.route.get('/customer', auth, getAll(this));
}