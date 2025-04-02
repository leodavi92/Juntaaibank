const { MongoClient } = require('mongodb');

const uri = 'mongodb://192.168.1.102:27017/juntaaibank';
const dbName = 'juntaaibank';

const collections = {
  users: 'users',
  groups: 'groups',
  transactions: 'transactions',
  sessions: 'sessions'
};

const createIndexes = async (db) => {
  // Índices para users
  await db.collection(collections.users).createIndex({ email: 1 }, { unique: true });
  
  // Índices para groups
  await db.collection(collections.groups).createIndex({ "membros.userId": 1 });
  await db.collection(collections.groups).createIndex({ nome: 1 });
  
  // Índices para transactions
  await db.collection(collections.transactions).createIndex({ 
    groupId: 1, 
    userId: 1, 
    status: 1 
  });
  
  // Índices para sessions
  await db.collection(collections.sessions).createIndex(
    { createdAt: 1 }, 
    { expireAfterSeconds: 24 * 60 * 60 } // Auto-delete após 24h
  );
};

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    
    await createIndexes(db);
    
    console.log('Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  collections
};