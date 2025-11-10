const config = {
    database: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'techhaven',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: '+00:00'
    },
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    bcryptSaltRounds: 10,
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    upload: {
        directory: 'uploads',
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        from: process.env.EMAIL_FROM || 'TechHaven <noreply@techhaven.com>'
    },
    session: {
        secret: process.env.SESSION_SECRET || 'session-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },
    pagination: {
        defaultLimit: 10,
        maxLimit: 100
    },
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
    },
    cache: {
        enabled: true,
        ttl: 60 * 5 // 5 minutes
    },
    api: {
        rateLimits: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    }
};

export default config;