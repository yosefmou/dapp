import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://yomou95:4j12jKFCXZbs2rhp@cluster0.wzzlwhx.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    return client.db();
  } catch (err) {
    console.error('Failed to connect to the database', err);
  }
}

async function getNumbers() {
  try {
  const db = await connectToDatabase();
  const collection = db.collection('numbers');

  console.log(collection)
  return collection.find({}).limit(10).toArray();
  }
  catch (err) {
    console.error('Failed to get numbers', err);
  }
}

async function addNumber(walletAddress, number) {
  const db = await connectToDatabase();
  const collection = db.collection('numbers');
  return collection.insertOne({ walletAddress, number });
}

async function findNumber(walletAddress) {
  const db = await connectToDatabase();
  const collection = db.collection('numbers');
  return collection.findOne({ walletAddress });
}

export { 
  connectToDatabase,
  getNumbers,
  addNumber,
  findNumber
 };
