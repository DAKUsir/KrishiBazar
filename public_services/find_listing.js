import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb+srv://agri:krishi@cluster0.qkki81l.mongodb.net/test?retryWrites=true&w=majority';

console.log('Connecting to:', uri);

mongoose.connect(uri)
  .then(async (conn) => {
    console.log('Successfully connected to host:', conn.connection.host);
    
    // Query yieldlistings
    const listings = await conn.connection.db.collection('yieldlistings').find({}).toArray();
    console.log('All YieldListings in DB:');
    listings.forEach(l => {
      console.log(` - ID: ${l._id.toString()}, Crop: ${l.crop}, Quantity: ${l.quantity}, Status: ${l.status}, PricePerUnit: ${l.pricePerUnit}`);
    });

    const searchId = '6a106e06196decf0f9270c6a';
    try {
      const found = await conn.connection.db.collection('yieldlistings').findOne({ _id: new mongoose.Types.ObjectId(searchId) });
      console.log(`Search result for ID ${searchId}:`, found ? 'FOUND!' : 'NOT FOUND');
    } catch (e) {
      console.log('Error search ID:', e.message);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
