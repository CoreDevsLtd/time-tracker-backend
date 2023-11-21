import demo from './demo/demo';
import user from './user/user';
import task from './task/task';
import service from './service/service';
import customer from './customer/customer';

export const services = (app) => {
  app.configure(demo);
  app.configure(user);
  app.configure(task);
  app.configure(service);
  app.configure(customer);
};
