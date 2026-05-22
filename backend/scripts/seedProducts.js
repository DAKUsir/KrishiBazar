/**
 * Seed script: populates the database with sample marketplace products
 * Run: node backend/scripts/seedProducts.js
 */
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishibazar';

const products = [
  { name: 'Mancozeb 75% WP', description: 'Contact fungicide for early and late blight, downy mildew', category: 'Pesticide', price: 195, unit: 'kg', brand: 'UPL', rating: 4.6, reviewCount: 324, inStock: true, tags: ['fungicide', 'tomato', 'potato', 'blight'], aiRecommendedFor: ['Early Blight', 'Late Blight', 'Tomato', 'Potato'], isFeatured: true },
  { name: 'NPK 19:19:19 Water Soluble', description: 'Balanced water soluble fertilizer for all crops', category: 'Fertilizer', price: 850, unit: '25kg', brand: 'Aries Agro', rating: 4.8, reviewCount: 512, inStock: true, tags: ['fertilizer', 'npk', 'all crops'], aiRecommendedFor: ['All Crops'], isFeatured: true },
  { name: 'Organic Neem Oil 10000 PPM', description: 'Natural insecticide and fungicide from cold-pressed neem seeds', category: 'Pesticide', price: 420, unit: 'liter', brand: 'Dhanuka', rating: 4.4, reviewCount: 189, inStock: true, tags: ['organic', 'neem', 'insecticide', 'fungicide'], aiRecommendedFor: ['Organic Farming', 'Pest Control'] },
  { name: 'Hybrid Tomato Seeds F1', description: 'High yielding hybrid tomato variety resistant to TYLCV and early blight', category: 'Seed', price: 560, unit: '10g', brand: 'Syngenta', rating: 4.7, reviewCount: 267, inStock: true, tags: ['tomato', 'hybrid', 'disease-resistant'], aiRecommendedFor: ['Tomato'], isFeatured: true },
  { name: 'Chlorothalonil 75% WP', description: 'Broad-spectrum fungicide for vegetables and field crops', category: 'Pesticide', price: 310, unit: 'kg', brand: 'Bayer', rating: 4.3, reviewCount: 145, inStock: true, tags: ['fungicide', 'vegetable', 'field crops'] },
  { name: 'Potassium Nitrate 13-0-45', description: 'High potassium fertilizer ideal for fruiting and root crops', category: 'Fertilizer', price: 1200, unit: '25kg', brand: 'Haifa', rating: 4.6, reviewCount: 98, inStock: true, tags: ['potassium', 'fertilizer', 'fruiting'] },
  { name: 'Copper Oxychloride 50% WP', description: 'Preventive fungicide and bactericide for multiple crops', category: 'Pesticide', price: 165, unit: 'kg', brand: 'Crystal Crop', rating: 4.2, reviewCount: 201, inStock: true, tags: ['copper', 'preventive', 'fungicide', 'bactericide'] },
  { name: 'Drip Irrigation Kit - 1 Acre', description: 'Complete drip irrigation setup for 1 acre, includes pipes, drippers and fittings', category: 'Tool', price: 8500, unit: 'set', brand: 'Netafim', rating: 4.9, reviewCount: 76, inStock: true, tags: ['irrigation', 'drip', 'water saving'], isFeatured: true },
  { name: 'Spray Pump - 16L Knapsack', description: 'Manual knapsack sprayer with adjustable nozzle, 16L capacity', category: 'Tool', price: 1250, unit: 'piece', brand: 'Kisankraft', rating: 4.5, reviewCount: 342, inStock: true, tags: ['sprayer', 'tool', 'manual'] },
  { name: 'Propiconazole 25% EC', description: 'Systemic fungicide for rice blast, rust and leaf spot diseases', category: 'Pesticide', price: 280, unit: '500ml', brand: 'PI Industries', rating: 4.4, reviewCount: 167, inStock: true, tags: ['systemic', 'rice', 'wheat', 'fungicide'], aiRecommendedFor: ['Blast Disease', 'Yellow Rust', 'Rice', 'Wheat'] },
  { name: 'DAP (Diammonium Phosphate)', description: 'High phosphorus fertilizer for root and shoot development', category: 'Fertilizer', price: 1400, unit: '50kg', brand: 'IFFCO', rating: 4.7, reviewCount: 891, inStock: true, tags: ['dap', 'phosphorus', 'root growth'], isFeatured: true },
  { name: 'Imidacloprid 17.8% SL', description: 'Systemic insecticide for sucking pests including whitefly, aphids and thrips', category: 'Pesticide', price: 195, unit: '250ml', brand: 'Bayer', rating: 4.5, reviewCount: 234, inStock: true, tags: ['insecticide', 'whitefly', 'aphids', 'sucking pest'] },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const MarketplaceProduct = require('./models/MarketplaceProduct');
    await MarketplaceProduct.deleteMany({});
    await MarketplaceProduct.insertMany(products);

    console.log(`✅ Seeded ${products.length} products`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
