import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { PrismaService } from './prisma.service';
import { scoreLead } from './scoring/lead-score.util';

interface ImportRow {
  name?: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: string;
  review_count?: string;
  city?: string;
  country?: string;
}

@Controller('leads')
export class LeadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('phaseId') phaseId?: string,
    @Query('unassigned') unassigned?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = { deletedAt: null };
    if (phaseId) where.phaseId = +phaseId;
    if (unassigned === 'true') where.phaseId = null;
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip, take, orderBy: [{ score: 'desc' }, { createdAt: 'desc' }], include: { phase: true } }),
      this.prisma.lead.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  // Ported from Worth-Contacting CRM (#12) — "which city to prospect next"
  // signal: unassigned leads grouped by country, ranked by average score, so
  // the highest-opportunity, not-yet-planned geography surfaces first.
  @Get('geography')
  async geography() {
    const leads = await this.prisma.lead.findMany({ where: { deletedAt: null, phaseId: null } });
    const byCountry = new Map<string, { count: number; totalScore: number; noWebsite: number }>();
    for (const l of leads) {
      const key = l.country ?? 'Unknown';
      if (!byCountry.has(key)) byCountry.set(key, { count: 0, totalScore: 0, noWebsite: 0 });
      const c = byCountry.get(key)!;
      c.count++;
      c.totalScore += l.score;
      if (!l.website) c.noWebsite++;
    }
    const countries = Array.from(byCountry.entries())
      .map(([country, c]) => ({
        country,
        count: c.count,
        avgScore: Math.round((c.totalScore / c.count) * 10) / 10,
        noWebsitePct: Math.round((c.noWebsite / c.count) * 100),
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
    return { countries };
  }

  @Post()
  create(@Body() body: any) {
    const { name, category, address, phone, website, rating, reviewCount, city, country } = body;
    if (!name) throw new BadRequestException('name is required');
    const { score, reasons } = scoreLead({ website, rating, reviewCount, phone });
    return this.prisma.lead.create({
      data: {
        name, category, address, phone, website,
        rating: rating !== undefined ? Number(rating) : undefined,
        reviewCount: reviewCount !== undefined ? Number(reviewCount) : undefined,
        city, country, score, reasons,
      },
    });
  }

  @Post('import')
  async import(@Body() body: { csv?: string }) {
    const { csv } = body;
    if (!csv) throw new BadRequestException('csv is required');

    let rows: ImportRow[];
    try {
      rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
    } catch (err) {
      throw new BadRequestException(`Could not parse CSV: ${String(err)}`);
    }
    if (rows.length === 0) throw new BadRequestException('CSV had no rows');

    let imported = 0;
    for (const row of rows) {
      if (!row.name) continue;
      const { score, reasons } = scoreLead({ website: row.website, rating: row.rating, reviewCount: row.review_count, phone: row.phone });
      await this.prisma.lead.create({
        data: {
          name: row.name,
          category: row.category || undefined,
          address: row.address || undefined,
          phone: row.phone || undefined,
          website: row.website || undefined,
          rating: row.rating ? Number(row.rating) : undefined,
          reviewCount: row.review_count ? Number(row.review_count) : undefined,
          city: row.city || undefined,
          country: row.country || undefined,
          score, reasons,
        },
      });
      imported++;
    }
    return { imported, skipped: rows.length - imported };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['name', 'category', 'address', 'phone', 'website', 'city', 'country', 'status']) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.phaseId !== undefined) data.phaseId = body.phaseId === null ? null : Number(body.phaseId);
    return this.prisma.lead.update({ where: { id: +id }, data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.lead.update({ where: { id: +id }, data: { deletedAt: new Date() } });
  }
}
