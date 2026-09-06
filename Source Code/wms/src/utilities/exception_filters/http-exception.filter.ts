import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";

const errorMessage = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    500: "Internal Server Error",
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        //const request = ctx.getRequest();
        const status = exception.getStatus();

        const exceptionResponse = exception.getResponse();
        let message : any;
        
        if(typeof(exceptionResponse) === 'string'){
            const jsonExceptionResponse = JSON.parse(exceptionResponse);
            message = jsonExceptionResponse.message;
        } else {
            message = exceptionResponse['message'];
        }

        if(message == null || message == undefined){
            message = errorMessage[status];
        }

        response.status(status).json({
            statusCode: status,
            message: message,
        });
    }
}