import { Module } from '@bylive/ioc';
import { UserModule } from './modules/user/user.module';
import { ReptilesModule } from './modules/reptiles/reptiles.module';
import { UploadModule } from './modules/upload/upload.module';
@Module({
  imports: [UserModule,ReptilesModule,UploadModule],
})
export class appModule {}
