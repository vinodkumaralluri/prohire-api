import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  // Swagger Documentation configs
  const config = new DocumentBuilder()
    .setTitle('ProHire API')
    .setDescription('Backend APIs for ProHire')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port, configService.get('SERVER_HOST'));
}
bootstrap();
