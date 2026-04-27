"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }));
    const swaggerPath = 'api-docs';
    app.use(`/${swaggerPath}`, (_req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        next();
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Flamenquito Fusión API')
        .setDescription('API para generación, análisis y gestión de letras de flamenquito fusión')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
        customSiteTitle: 'Flamenquito Fusión API',
        customCss: `
      .swagger-ui .topbar { display: none; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .swagger-ui .info .title { color: #b91c1c; }
      .swagger-ui .opblock.opblock-post { border-color: #16a34a; background: rgba(22,163,74,0.05); }
      .swagger-ui .opblock.opblock-get { border-color: #2563eb; background: rgba(37,99,235,0.05); }
    `,
        customfavIcon: 'https://abacus.ai/favicon.ico',
    });
    await app.listen(3000, '0.0.0.0');
    new common_1.Logger('Bootstrap').log('🎸 Flamenquito Fusión API running on port 3000');
}
bootstrap();
//# sourceMappingURL=main.js.map