// This file exports the schema shapes for documentation purposes
export const schemas = {
    Product: {
        id: 'string',
        seller_id: 'string',
        sku: 'string',
        title: 'string',
        short_description: 'string?',
        long_description: 'string?',
        price: 'number',
        currency: 'string',
        weight_grams: 'number?',
        height_mm: 'number?',
        width_mm: 'number?',
        depth_mm: 'number?',
        is_active: 'boolean',
        created_at: 'Date',
        updated_at: 'Date?',
        categories: 'Array<Category>?',
        images: 'Array<ProductImage>?'
    },

    User: {
        id: 'string',
        email: 'string',
        password_hash: 'string',
        username: 'string?',
        created_at: 'Date',
        updated_at: 'Date?',
        is_active: 'boolean',
        profile: 'UserProfile?',
        roles: 'string[]?'
    },

    Category: {
        id: 'number',
        parent_id: 'number?',
        name: 'string',
        slug: 'string',
        description: 'string?',
        subcategories: 'Category[]?',
        product_count: 'number?'
    },

    Order: {
        id: 'string',
        buyer_id: 'string',
        seller_id: 'string',
        shipping_address_id: 'string',
        billing_address_id: 'string?',
        total_amount: 'number',
        currency: 'string',
        status: 'string',
        placed_at: 'Date',
        updated_at: 'Date?',
        items: 'OrderItem[]?',
        shipping_address: 'Address?',
        billing_address: 'Address?'
    },

    Shop: {
        id: 'string',
        user_id: 'string',
        business_name: 'string?',
        registration_number: 'string?',
        created_at: 'Date',
        updated_at: 'Date?',
        products: 'number?',
        rating: 'number?'
    },

    Payment: {
        id: 'string',
        order_id: 'string',
        amount: 'number',
        currency: 'string',
        payment_method_id: 'number',
        provider_ref: 'string?',
        status: 'string',
        created_at: 'Date',
        updated_at: 'Date?'
    }
};