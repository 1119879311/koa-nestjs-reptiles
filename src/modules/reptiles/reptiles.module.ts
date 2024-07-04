import { Module } from '@bylive/ioc';
import { ReptilesController } from './reptiles.controller';
import { MuscieServer } from './reptiles.service';


@Module({
  controllers: [ReptilesController],
  providers:[MuscieServer]
  
})
export class ReptilesModule {}