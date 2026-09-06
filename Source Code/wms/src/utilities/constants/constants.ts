import KeyvRedis from "@keyv/redis";
import { MailerModule } from "@nestjs-modules/mailer";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Keyv, KeyvCacheableMemory } from "cacheable";
import { Agent } from "../../modules/agents/entities/agent.entity";
import { Category } from "../../modules/categories/entities/category.entity";
import { ExportOrder } from "../../modules/export-orders/entities/export-order.entity";
import { ExportOrderItem } from "../../modules/export-orders/entities/export-order-item.entity";
import { ImportOrder } from "../../modules/import-orders/entities/import-order.entity";
import { ImportOrderItem } from "../../modules/import-orders/entities/import-order-item.entity";
import { InventoryHistory } from "../../modules/inventory-histories/entities/inventory-history.entity";
import { Order } from "../../modules/orders/entities/order.entity";
import { OrderProduct } from "../../modules/orders/entities/order-product.entity";
import { Product } from "../../modules/products/entities/product.entity";
import { ProductCategory } from "../../modules/products/entities/product-category.entitiy";
import { Supplier } from "../../modules/suppliers/entities/supplier.entity";
import { User } from "../../modules/users/entities/user.entity";
import { Warehouse } from "../../modules/warehouses/entities/warehouse.entity";
import { WarehouseEmployee } from "../../modules/warehouses/entities/warehouse-employee.entity";
import { WarehouseProduct } from "../../modules/warehouses/entities/warehouse-product.entity";
import { WarehouseProductBatch } from "../../modules/warehouses/entities/warehouse-product-batch.entity";

export enum TIMEOUT{
    TEST_TIMEOUT= 100000,
}

export const ROOT_SETTING = [
    ConfigModule.forRoot({
        envFilePath: '.env'
    }),
    TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT!.toString()),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [
            Agent, Category, ExportOrder, ExportOrderItem, ImportOrder, ImportOrderItem, InventoryHistory,
            Order, OrderProduct, Product, ProductCategory, Supplier, User, Warehouse, WarehouseEmployee,
            WarehouseProduct, WarehouseProductBatch
        ],
        synchronize: true,
    }),
    CacheModule.register({
        useFactory: async () => {
        return {
            stores: [
            new Keyv({store: new KeyvCacheableMemory()}),
            new KeyvRedis('redis://localhost:6379'),
            ]
        }
        },
        isGlobal: true,
        ttl: 60 * 1000
    }),
    ThrottlerModule.forRoot({
        throttlers: [
        {
            name: 'short',
            ttl: 1000,
            limit: 5,
        },
        {
            name: 'medium',
            ttl: 10000,
            limit: 40
        },
        {
            name: 'long',
            ttl: 60000,
            limit: 200
        }
        ]
    }),
    BullModule.forRoot({
        connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        }
    }),
    MailerModule.forRoot({
        transport: {
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_APP_PASSWORD
        }
        },
    }),
];