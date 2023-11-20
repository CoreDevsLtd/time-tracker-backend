import { auth, checkRole } from '../middlewares';
import { create, update, get, getAll, remove } from './service.entity';

export default function service() {
  /**
  * POST /service
  * @description This route is used to create a new service. only admin can create a service.
  * @response {Object} 201 - created new service object.
  */
  this.route.post('/service', auth, checkRole(['admin']), create(this));

  /**
  * GET /service/:id
  * @description This route is used to get service.
  * @response {Object} 200 - service object.
  */
  this.route.get('/service/:id', auth, checkRole(['admin']), get(this));

  /**
  * GET /service
  * @description This route is used to get all service information.
  * @response {Object} 200 - service object.
  */
  this.route.get('/service', auth, checkRole(['admin', 'user']), getAll(this));

  /**
  * PATCH /service/:id
  * @description This route is used to update service. only admin can update service.
  * @response {Object} 200 - updated service object.
  */
  this.route.patch('/service/:id', auth, checkRole(['admin']), update(this));

  /**
  * DELETE /service/:id
  * @description This route is used to delete service. only admin can delete service.
  * @response {Object} 200 - success or fail message.
  */
  this.route.delete('/service/:id', auth, checkRole(['admin']), remove(this));
}