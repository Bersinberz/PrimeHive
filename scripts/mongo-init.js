// MongoDB initialization script
// Runs once when the container is first created

db = db.getSiblingDB('primehive');

// Create application user with least-privilege access
db.createUser({
  user: 'primehive_app',
  pwd: process.env.MONGO_APP_PASSWORD || 'change_this_in_production',
  roles: [
    { role: 'readWrite', db: 'primehive' }
  ]
});

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true });
db.users.createIndex({ role: 1, status: 1 });

db.orders.createIndex({ customer: 1, createdAt: -1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ deliveryPartnerId: 1, deliveryStatus: 1 });
db.orders.createIndex({ refundStatus: 1 });

db.products.createIndex({ status: 1 });
db.products.createIndex({ createdBy: 1 });
db.products.createIndex({ name: 'text', description: 'text' });

db.returns.createIndex({ status: 1 });
db.returns.createIndex({ customer: 1 });
db.returns.createIndex({ order: 1 });

print('✅ PrimeHive MongoDB initialized successfully');
