import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LeadsController } from './leads.controller';
import { ExpansionPhasesController } from './expansion-phases.controller';

@Module({
  controllers: [LeadsController, ExpansionPhasesController],
  providers: [PrismaService],
})
export class AppModule {}
