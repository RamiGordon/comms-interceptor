import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedServer: any;

export const handler = async (event, context) => {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule);
    const options = new DocumentBuilder()
      .setTitle('Comms Interceptor')
      .setDescription(
        'Endpoints for intercepting and storing transmissions from spacecraft, enabling the analysis and logging of intercepted messages, signals, and communications within a galactic context.',
      )
      .addServer(
        'https://1kj1uy2c69.execute-api.us-west-1.amazonaws.com/dev',
        'aws',
      )
      .addServer('http://localhost:3000', 'local')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(nestApp, options);
    SwaggerModule.setup('api-docs', nestApp, document, {
      customSiteTitle: 'Swagger Docs',
      customfavIcon:
        'https://upload.wikimedia.org/wikipedia/commons/a/ab/Swagger-logo.png?20170812110931',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
      ],
    });

    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};
