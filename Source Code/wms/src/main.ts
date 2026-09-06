import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './utilities/exception_filters/http-exception.filter';
import { AuthGuard } from './modules/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { HttpExceptionDto } from './utilities/global_dto/http-exception.dto';

async function bootstrap(){
  const app = await NestFactory.create(AppModule);

  // Swagger
  const config = new DocumentBuilder()
                      .setTitle("Warehouse management system")
                      .addGlobalResponse({ status: 400, description: 'Bad request', type: HttpExceptionDto, example: {
                        statusCode: 400,
                        message: 'Bad request'
                      }})
                      .addGlobalResponse({ status: 401, description: 'Unauthorized', type: HttpExceptionDto, example: {
                        statusCode: 401,
                        message: 'Unauthorized'
                      }})
                      .addGlobalResponse({status: 403, description: 'Forbidden', type: HttpExceptionDto, example: {
                        statusCode: 403,
                        message: 'Forbidden'
                      }})
                      .addGlobalResponse({ status: 500, description: 'Internal server error', type: HttpExceptionDto, example: {
                        statusCode: 500,
                        message: 'Internal server error'
                      }})
                      .addBearerAuth()
                      .build();
                      
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, documentFactory, {
    yamlDocumentUrl: 'swagger/yaml',
  });
  
  // Apply @Exclude in model database
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Su dung global filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // global JWT
  app.useGlobalGuards(new AuthGuard(new JwtService(), new Reflector()));

  // Validation data
  // Áp dụng pipe cho toàn hệ thống, đảm bảo các endpoint nhận đúng các giá trị mong muốn
  // Thuộc tính bên trong hàm khởi tạo là tắt thông báo lỗi khi endpoint nhận dữ liệu sai định dạng
  // cho trường hợp hệ thống hoạt động trong môi trường thực tế
  // whilelist: false --> nếu có nhiều thuộc tính hơn lớp DTO đã định nghĩa, request vẫn được thông qua, nếu set = true, thì request sẽ bị chặn
  // Transform: true --> tự động parse request json object sang DTO tương ứng trong endpoint
  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
