import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { THEMES, EMOTIONS, STYLES } from './categories.data';

@ApiTags('categories')
@Controller('api/categories')
export class CategoriesController {
  @Get('themes')
  @ApiOperation({ summary: 'Get predefined themes' })
  themes() { return { items: THEMES }; }

  @Get('emotions')
  @ApiOperation({ summary: 'Get predefined emotions' })
  emotions() { return { items: EMOTIONS }; }

  @Get('styles')
  @ApiOperation({ summary: 'Get predefined styles' })
  styles() { return { items: STYLES }; }
}
