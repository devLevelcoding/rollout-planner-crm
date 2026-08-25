import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('expansion-phases')
export class ExpansionPhasesController {
  constructor(private readonly prisma: PrismaService) {}

  // The planning dashboard: each phase with its assigned leads' aggregate
  // readiness (count, avg score) — "a city-by-city expansion planner next
  // to the live pipeline."
  @Get()
  async findAll() {
    const phases = await this.prisma.expansionPhase.findMany({ orderBy: { order: 'asc' }, include: { leads: true } });
    const data = phases.map((p) => ({
      ...p,
      leadCount: p.leads.length,
      avgScore: p.leads.length ? Math.round((p.leads.reduce((s, l) => s + l.score, 0) / p.leads.length) * 10) / 10 : 0,
    }));
    return { data, total: data.length };
  }

  @Post()
  create(@Body() body: any) {
    const { name, order, notes } = body;
    if (!name) throw new BadRequestException('name is required');
    return this.prisma.expansionPhase.create({ data: { name, order: order ?? 0, notes } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['name', 'notes']) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.order !== undefined) data.order = Number(body.order);
    return this.prisma.expansionPhase.update({ where: { id: +id }, data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.expansionPhase.delete({ where: { id: +id } });
  }
}
