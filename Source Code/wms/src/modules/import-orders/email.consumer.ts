import { MailerService } from "@nestjs-modules/mailer";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor('importSuccessfulEmailQueue')
export class SuccessImportEmailConsumer extends WorkerHost {
    constructor(
        private readonly mailerService: MailerService,
    ){
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        switch(job.name){
            case 'sendSuccessImportEmail': {
                const data = job.data;
                console.log(data);
                let importText = `\tImportOrderID: ${data.id}. \n\tDanh sách sản phẩm:`
                data.listImportOrderItem.forEach((importOrderItem, idx) => {
                    importText += `\n\t\t${idx + 1}. Tên sản phẩm: ${importOrderItem['product'].name}, mã sản phẩm: ${importOrderItem.productId}, số lượng: ${importOrderItem.quantity}, đơn vị: ${importOrderItem.unit}.`;
                });

                const sentMessageInfor = await this.mailerService.sendMail({
                    to: 'hoanghaidinh1124@gmail.com',
                    subject: 'Import Successful',
                    text: `Nhập kho thành công: \n` + importText,
                });
                console.log('sent ok');
                console.log(sentMessageInfor);
            }
        }
    }
}