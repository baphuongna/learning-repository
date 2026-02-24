import { Module } from '@nestjs/common';
import { DocumentsController, SearchController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [DocumentsController, SearchController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
