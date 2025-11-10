import { RowDataPacket, ResultSetHeader as MySQLResultSetHeader } from 'mysql2';

// Database types
export interface QueryResult<T = any> extends RowDataPacket {
    [key: string]: any;
}

export interface ResultSetHeader extends MySQLResultSetHeader {}

// Model types
export type Product = {
    id: number;
    seller_id: number;
    sku: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    stock: number;
    category_id: number;
    brand?: string;
    specifications?: object;
    image_url?: string;
    status: string;
    created_at: Date;
    updated_at?: Date;
};

export type User = {
    id: number;
    email: string;
    password_hash: string;
    username?: string;
    full_name?: string;
    phone?: string;
    role: string;
    status: string;
    created_at: Date;
    updated_at?: Date;
};

export type Category = {
    id: number;
    parent_id?: number;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    status: string;
    created_at: Date;
    updated_at?: Date;
};

export type Order = {
    id: number;
    user_id: number;
    shipping_address_id: number;
    billing_address_id?: number;
    total_amount: number;
    status: string;
    payment_method: string;
    shipping_method: string;
    notes?: string;
    created_at: Date;
    updated_at?: Date;
};

export interface Shop extends RowDataPacket {
    id: number;
    seller_id: number;
    name: string;
    description: string;
    category: string;
    address: string;
    status: string;
    rejection_reason?: string;
    suspension_reason?: string;
    suspended_until?: Date;
    created_at: Date;
    updated_at?: Date;
}