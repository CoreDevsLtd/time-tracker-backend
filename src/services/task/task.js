import { auth, checkRole } from '../middlewares';
import { create, update, get, getAll, remove } from './task.entity';

export default function task() {
  /**
  * POST /task
  * @description This route is used to create a new task. only admin can create a task.
  * @response {Object} 201 - created new task object.
  */
  this.route.post('/task', auth, checkRole(['admin', 'user']), create(this));

  /**
  * GET /task/:id
  * @description This route is used to get task.
  * @response {Object} 200 - task object.
  */
  this.route.get('/task/:id', auth, checkRole(['admin', 'user']), get(this));

  /**
  * GET /task
  * @description This route is used to get all task information.
  * @response {Object} 200 - task object.
  */
  this.route.get('/task', auth, checkRole(['admin', 'user']), getAll(this));

  /**
  * PATCH /task/:id
  * @description This route is used to update task. only admin can update task.
  * @response {Object} 200 - updated task object.
  */
  this.route.patch('/task/:id', auth, checkRole(['admin', 'user']), update(this));

  /**
  * DELETE /task/:id
  * @description This route is used to delete task. only admin can delete task.
  * @response {Object} 200 - success or fail message.
  */
  this.route.delete('/task/:id', auth, checkRole(['admin', 'user']), remove(this));
}