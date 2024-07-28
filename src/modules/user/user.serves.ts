import { Injectable } from '@bylive/ioc';

import { tk_user } from '../../entity/tk_user.entity';
import { AppDataSource } from '../../typeorm';

@Injectable()
export class UserServer {
  constructor() { }
  async find() {
    const userRepository =await AppDataSource.getRepository(tk_user);
    const users = await userRepository.find({ relations: ['roles'] });
    return users
  }
}
