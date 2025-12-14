import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfiguration } from './config/app';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('My API')
        .setDescription('API documentation')
        .setVersion('1.0.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Serve Swagger UI at /api and JSON at /api-json
    SwaggerModule.setup('api', app, document, { jsonDocumentUrl: 'api-json' });

    app.use((req: any, res: any, next: any) => {
        res.on('finish', () => console.log('[FINISH]', req.method, req.originalUrl, res.statusCode));
        res.on('close',  () => console.log('[CLOSE ]', req.method, req.originalUrl));
        next();
    });

    await app.listen(appConfiguration().port);
}
bootstrap();
