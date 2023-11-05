import { connectToDatabase } from '../../db';

export default async (req, res) => {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const db = await connectToDatabase();
  const collection = db.collection('numbers');

  try {
    const result = await collection.findOne({ walletAddress });
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ error: 'Record not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to find the record' });
  }
};
