import { Module } from '@bylive/ioc';
import { UserModule } from './modules/user/user.module';
import { ReptilesModule } from './modules/reptiles/reptiles.module';
import { UploadModule } from './modules/upload/upload.module';
import { AdminModule } from './modules/admin/admin.module';
@Module({
  imports: [UserModule,ReptilesModule,UploadModule,AdminModule],
  providers:[
    
  ]
})
export class appModule {}
