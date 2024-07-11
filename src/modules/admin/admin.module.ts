import { Module } from '@bylive/ioc';
import { AdminController } from './admin.controller';



@Module({
  controllers: [AdminController],
  providers:[]
  
})
export class AdminModule {}