import { Module } from '@bylive/ioc';
import { UploadController } from './upload.controller';
import { UploadServer } from './upload.service';


@Module({
  controllers: [UploadController],
  providers:[UploadServer]
  
})
export class UploadModule {}