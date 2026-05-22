import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Listing from '../models/Listing.js'; // maps to YieldListing model (yieldlistings collection)
import User from '../models/User.js';       // maps to User model (users collection)
import Scan from '../models/Scan.js';       // maps to Scan model (scans collection)
import Lead from '../models/Lead.js';
import twilio from 'twilio';

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Haversine formula to calculate distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
}

// Helper to format YieldListing document to match the React frontend API expectation
const formatListingForFrontend = async (yieldDoc) => {
  const plainDoc = yieldDoc.toObject();
  
  // Calculate relative stats
  const sellerId = yieldDoc.seller ? yieldDoc.seller._id : null;
  let scanCount = 0;
  if (sellerId) {
    scanCount = await Scan.countDocuments({ user: sellerId });
  }
  const isVerified = scanCount >= 5;

  // Shelf life calculation from dates (in days)
  const fromDate = new Date(yieldDoc.availableFrom || Date.now());
  const toDate = new Date(yieldDoc.availableTo || Date.now() + 5 * 24 * 60 * 60 * 1000);
  const shelfLifeDays = Math.max(1, Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24)));

  return {
    _id: plainDoc._id,
    crop: plainDoc.crop,
    quantity: plainDoc.quantity,
    price: plainDoc.pricePerUnit,
    location: {
      village: plainDoc.location?.address || 'Local Village',
      district: plainDoc.location?.district || 'Unknown District',
      coordinates: plainDoc.location?.coordinates || { lat: 12.9716, lng: 77.5946 }
    },
    farmer: {
      name: plainDoc.seller?.name || plainDoc.contact?.phone || 'Farmer',
      phone: plainDoc.contact?.phone || '+910000000000',
      isVerified: isVerified
    },
    image: plainDoc.images && plainDoc.images.length > 0 ? plainDoc.images[0] : '',
    harvestDate: plainDoc.availableFrom || plainDoc.createdAt,
    shelfLife: shelfLifeDays,
    notes: plainDoc.description || '',
    reports: plainDoc.reports || 0,
    status: plainDoc.status || 'active',
    createdAt: plainDoc.createdAt
  };
};

// Seed mock listings in collections
export const seedListings = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty! Seeding users, scans, and yield listings...');
      
      const seedFarmers = [
        {
          name: 'Ramesh Gowda',
          phone: '+919876543210',
          googleId: 'google_ramesh',
          email: 'ramesh.gowda@farmshield.ai',
          isOnboarded: true,
          farmDetails: { state: 'Karnataka', district: 'Kolar', farmArea: 4, soilType: 'Loam' }
        },
        {
          name: 'Siddappa K.',
          phone: '+918765432109',
          googleId: 'google_siddappa',
          email: 'siddappa@farmshield.ai',
          isOnboarded: true,
          farmDetails: { state: 'Karnataka', district: 'Mysore', farmArea: 5, soilType: 'Clay' }
        },
        {
          name: 'Manjunatha swamy',
          phone: '+917654321098',
          googleId: 'google_manju',
          email: 'manju@farmshield.ai',
          isOnboarded: true,
          farmDetails: { state: 'Karnataka', district: 'Mandya', farmArea: 2, soilType: 'Silt' }
        },
        {
          name: 'Basavaraj Patil',
          phone: '+916543210987',
          googleId: 'google_basava',
          email: 'basavaraj@farmshield.ai',
          isOnboarded: true,
          farmDetails: { state: 'Karnataka', district: 'Belagavi', farmArea: 8, soilType: 'Mixed' }
        },
        {
          name: 'Anjinappa Gowda',
          phone: '+915432109876',
          googleId: 'google_anjinappa',
          email: 'anjinappa@farmshield.ai',
          isOnboarded: true,
          farmDetails: { state: 'Karnataka', district: 'Chitradurga', farmArea: 3, soilType: 'Sandy' }
        },
        {
          name: 'Mallikarjun Patil',
          phone: '+914321098765',
          googleId: 'google_mallika',
          email: 'mallikarjun@farmshield.ai',
          isOnboarded: true,
          farmDetails: { state: 'Karnataka', district: 'Dharwad', farmArea: 6, soilType: 'Black' }
        }
      ];

      const insertedUsers = await User.insertMany(seedFarmers);
      console.log('Seeded users:', insertedUsers.length);

      // Seed dynamic disease scans to trigger Verified status (>5 scans)
      // Ramesh: 6 scans (Verified), Siddappa: 5 scans (Verified), Basavaraj: 7 scans (Verified), Mallika: 8 scans (Verified)
      // Manjunatha: 2 scans (Not Verified), Anjinappa: 0 scans (Not Verified)
      const mockScans = [];
      const scanMap = {
        '+919876543210': 6,
        '+918765432109': 5,
        '+916543210987': 7,
        '+914321098765': 8,
        '+917654321098': 2,
        '+915432109876': 0
      };

      insertedUsers.forEach(user => {
        const count = scanMap[user.phone] || 0;
        for (let i = 0; i < count; i++) {
          mockScans.push({
            user: user._id,
            imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80',
            cropName: 'Tomato',
            diseaseName: 'Late Blight'
          });
        }
      });

      if (mockScans.length > 0) {
        await Scan.insertMany(mockScans);
        console.log('Seeded dynamic advisor scans:', mockScans.length);
      }

      // Seed listings in yieldlistings collection
      const mockListings = [
        {
          seller: insertedUsers[0]._id, // Ramesh
          crop: 'Tomato',
          quantity: 950,
          unit: 'kg',
          pricePerUnit: 12,
          totalPrice: 950 * 12,
          images: [],
          description: 'Freshly harvested vine tomatoes. Rich color, perfect for local retailers.',
          location: {
            address: 'Kolar Gold Fields',
            district: 'Kolar',
            state: 'Karnataka',
            coordinates: { lat: 13.1368, lng: 78.1292 }
          },
          contact: { phone: '+919876543210' },
          quality: 'A',
          availableFrom: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          availableTo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          seller: insertedUsers[1]._id, // Siddappa
          crop: 'Rice',
          quantity: 500,
          unit: 'kg',
          pricePerUnit: 25,
          totalPrice: 500 * 25,
          images: [],
          description: 'High-quality Sona Masuri paddy. Dry and ready for storage or milling.',
          location: {
            address: 'T. Narsipura',
            district: 'Mysore',
            state: 'Karnataka',
            coordinates: { lat: 12.2958, lng: 76.6394 }
          },
          contact: { phone: '+918765432109' },
          quality: 'Organic',
          availableFrom: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
          availableTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          seller: insertedUsers[2]._id, // Manjunatha
          crop: 'Potato',
          quantity: 1200,
          unit: 'kg',
          pricePerUnit: 8,
          totalPrice: 1200 * 8,
          images: [],
          description: 'Regular size potatoes. Cleaned and packed in 50kg gunny bags.',
          location: {
            address: 'Maddur',
            district: 'Mandya',
            state: 'Karnataka',
            coordinates: { lat: 12.5218, lng: 76.8951 }
          },
          contact: { phone: '+917654321098' },
          quality: 'B',
          availableFrom: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          seller: insertedUsers[3]._id, // Basavaraj
          crop: 'Chilli',
          quantity: 600,
          unit: 'kg',
          pricePerUnit: 40,
          totalPrice: 600 * 40,
          images: [],
          description: 'Byadgi red chillies. Moderate heat, extremely rich red natural color scan.',
          location: {
            address: 'Gokak',
            district: 'Belagavi',
            state: 'Karnataka',
            coordinates: { lat: 15.8497, lng: 74.4977 }
          },
          contact: { phone: '+916543210987' },
          quality: 'A',
          availableFrom: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          availableTo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          seller: insertedUsers[4]._id, // Anjinappa
          crop: 'Onion',
          quantity: 1500,
          unit: 'kg',
          pricePerUnit: 18,
          totalPrice: 1500 * 18,
          images: [],
          description: 'Medium sized onions. Dry skins, good keeping quality.',
          location: {
            address: 'Hiriyur',
            district: 'Chitradurga',
            state: 'Karnataka',
            coordinates: { lat: 14.2251, lng: 76.3980 }
          },
          contact: { phone: '+915432109876' },
          quality: 'B',
          availableFrom: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          availableTo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          seller: insertedUsers[5]._id, // Mallikarjun
          crop: 'Cotton',
          quantity: 2000,
          unit: 'kg',
          pricePerUnit: 65,
          totalPrice: 2000 * 65,
          images: [],
          description: 'Premium long-staple BT cotton. Free from trash and moisture.',
          location: {
            address: 'Navalgund',
            district: 'Dharwad',
            state: 'Karnataka',
            coordinates: { lat: 15.4589, lng: 75.0078 }
          },
          contact: { phone: '+914321098765' },
          quality: 'A',
          availableFrom: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          availableTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      ];

      await Listing.insertMany(mockListings);
      console.log('Seeded yieldlistings into database!');
    }
  } catch (error) {
    console.error('Error seeding YieldListings:', error);
  }
};

// GET all active listings with filters
router.get('/listings', async (req, res) => {
  try {
    const {
      crop,
      district,
      minQty,
      maxQty,
      minPrice,
      maxPrice,
      search,
      sort,
      lat,
      lng,
      maxDist
    } = req.query;

    let query = { status: 'active' };

    // Filters
    if (crop) {
      query.crop = crop;
    }

    if (district) {
      query['location.district'] = { $regex: district, $options: 'i' };
    }

    if (minQty || maxQty) {
      query.quantity = {};
      if (minQty) query.quantity.$gte = Number(minQty);
      // Treat 5000 as "5000+" (no upper limit)
      if (maxQty && Number(maxQty) < 5000) query.quantity.$lte = Number(maxQty);
      if (Object.keys(query.quantity).length === 0) delete query.quantity;
    }

    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      // Treat 150 as "150+" (no upper limit)
      if (maxPrice && Number(maxPrice) < 150) query.pricePerUnit.$lte = Number(maxPrice);
      if (Object.keys(query.pricePerUnit).length === 0) delete query.pricePerUnit;
    }

    if (search) {
      query.$or = [
        { crop: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort order
    let sortOption = { createdAt: -1 }; // Newest first by default
    if (sort === 'priceAsc') sortOption = { pricePerUnit: 1 };
    if (sort === 'priceDesc') sortOption = { pricePerUnit: -1 };
    if (sort === 'qtyDesc') sortOption = { quantity: -1 };
    if (sort === 'qtyAsc') sortOption = { quantity: 1 };

    // Find and populate seller details from 'users' collection
    const yieldDocs = await Listing.find(query)
      .populate('seller', 'name avatar farmDetails')
      .sort(sortOption);

    // Format all documents to match React frontend structure
    let formattedListings = [];
    for (const doc of yieldDocs) {
      const formatted = await formatListingForFrontend(doc);
      formattedListings.push(formatted);
    }

    // Geolocation distance filtering
    if (lat && lng) {
      const buyerLat = parseFloat(lat);
      const buyerLng = parseFloat(lng);

      formattedListings = formattedListings.map(listing => {
        const distance = getDistance(
          buyerLat,
          buyerLng,
          listing.location.coordinates.lat,
          listing.location.coordinates.lng
        );
        listing.distance = Math.round(distance * 10) / 10; // 1 decimal place
        return listing;
      });

      // Filter by max distance if requested
      if (maxDist) {
        const maxD = parseFloat(maxDist);
        formattedListings = formattedListings.filter(l => l.distance <= maxD);
      }

      // Sort by distance if sort option is 'distance'
      if (sort === 'distance') {
        formattedListings.sort((a, b) => a.distance - b.distance);
      }
    }

    res.json(formattedListings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET detailed listing
router.get('/listings/:id', async (req, res) => {
  try {
    const yieldDoc = await Listing.findById(req.params.id)
      .populate('seller', 'name avatar farmDetails');
      
    if (!yieldDoc) return res.status(404).json({ error: 'Listing not found' });
    
    // Increments views on the actual listing!
    yieldDoc.views = (yieldDoc.views || 0) + 1;
    await yieldDoc.save();

    const formatted = await formatListingForFrontend(yieldDoc);
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new listing
router.post('/listings', upload.single('image'), async (req, res) => {
  try {
    const {
      crop,
      quantity,
      price,
      village,
      district,
      lat,
      lng,
      farmerName,
      farmerPhone,
      harvestDate,
      shelfLife,
      notes
    } = req.body;

    // 1. Check if user exists in MongoDB Users collection
    let user = await User.findOne({ phone: farmerPhone });
    if (!user) {
      // Create user using structural definitions of users collection
      const sanitizedPhone = farmerPhone.replace(/\s+/g, '');
      user = await User.create({
        name: farmerName,
        phone: farmerPhone,
        googleId: `google_${sanitizedPhone}_${Date.now()}`,
        email: `${sanitizedPhone}_${Date.now()}@farmshield.ai`,
        isOnboarded: true,
        farmDetails: {
          state: 'Karnataka',
          district: district
        }
      });
      console.log(`[Created User] Real user created dynamically for farmer: ${farmerName} (${farmerPhone})`);
    }

    // Use uploaded file path if available
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    // Calculate Available To from shelf life (in days)
    const shelfLifeDays = Number(shelfLife) || 5;
    const availableFrom = harvestDate ? new Date(harvestDate) : new Date();
    const availableTo = new Date(availableFrom.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000);

    // 2. Insert into Mongoose YieldListing collection
    const newListing = new Listing({
      seller: user._id,
      crop,
      quantity: Number(quantity),
      unit: 'kg',
      pricePerUnit: Number(price),
      totalPrice: Number(quantity) * Number(price),
      images: imagePath ? [imagePath] : [],
      description: notes || '',
      location: {
        address: village,
        district: district,
        state: 'Karnataka',
        coordinates: {
          lat: Number(lat) || 12.9716, // Default Bangalore coordinates
          lng: Number(lng) || 77.5946
        }
      },
      contact: {
        phone: farmerPhone,
        whatsapp: farmerPhone,
        email: user.email
      },
      quality: 'A',
      availableFrom: availableFrom,
      availableTo: availableTo,
      status: 'active'
    });

    const savedListing = await newListing.save();

    // Populate seller details to build formatted listing for Socket.io
    const populated = await Listing.findById(savedListing._id).populate('seller', 'name avatar farmDetails');
    const formatted = await formatListingForFrontend(populated);

    // Trigger Socket.io real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_listing', formatted);
    }

    res.status(201).json(formatted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST express interest / lead
router.post('/leads', async (req, res) => {
  try {
    const { listingId, buyerName, buyerPhone, requestedQuantity } = req.body;

    const lead = new Lead({
      listingId,
      buyerName,
      buyerPhone,
      requestedQuantity: Number(requestedQuantity)
    });

    const savedLead = await lead.save();

    // Fetch listing details to notify the farmer
    const listing = await Listing.findById(listingId).populate('seller', 'name');
    if (listing) {
      console.log(`[SMS Simulation] To ${listing.contact.phone}: Hello, buyer ${buyerName} (${buyerPhone}) has expressed interest in buying ${requestedQuantity} kg of your ${listing.crop} via FarmShield AI!`);

      // Twilio integration
      const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env;
      if (TWILIO_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE) {
        try {
          const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
          await client.messages.create({
            body: `[FarmShield] ${buyerName} (${buyerPhone}) wants to buy ${requestedQuantity}kg of your ${listing.crop}. Contact them directly to finalize!`,
            from: TWILIO_PHONE,
            to: listing.contact.phone
          });
          console.log('[SMS Success] Twilio message sent successfully');
        } catch (twilioErr) {
          console.error('[SMS Error] Twilio message failed:', twilioErr.message);
        }
      }
    }

    res.status(201).json(savedLead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST report suspicious listing
router.post('/listings/:id/report', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    listing.reports = (listing.reports || 0) + 1;
    await listing.save();

    console.log(`[ALERT] YieldListing ${listing._id} (${listing.crop} in ${listing.location?.address}) has been reported! Total reports: ${listing.reports}`);

    res.json({ message: 'Listing reported successfully', reports: listing.reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple Mock Auth endpoints
router.post('/auth/otp-send', (req, res) => {
  const { phone } = req.body;
  console.log(`[SMS OTP Simulation] Sending OTP 123456 to ${phone}`);
  res.json({ success: true, message: 'OTP sent successfully (Hardcoded: 123456)' });
});

router.post('/auth/otp-verify', async (req, res) => {
  const { phone, otp } = req.body;
  if (otp === '123456') {
    // Lookup real farmer in Users collection
    let user = await User.findOne({ phone: phone });
    let isVerified = false;
    let name = 'Farmer Ji';

    if (user) {
      name = user.name;
      // Dynamically calculate verification based on scans
      const scanCount = await Scan.countDocuments({ user: user._id });
      isVerified = scanCount >= 5;
    }

    res.json({
      success: true,
      farmer: {
        phone,
        name: name,
        isVerified: isVerified
      }
    });
  } else {
    res.status(400).json({ success: false, error: 'Invalid OTP' });
  }
});

// GET current farmer's listings
router.get('/farmer-listings/:phone', async (req, res) => {
  try {
    const listings = await Listing.find({ 'contact.phone': req.params.phone }).sort({ createdAt: -1 });
    
    const formattedListings = [];
    for (const doc of listings) {
      const formatted = await formatListingForFrontend(doc);
      formattedListings.push(formatted);
    }
    
    res.json(formattedListings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update status (sold / active)
router.put('/listings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('seller', 'name avatar farmDetails');
    
    const formatted = await formatListingForFrontend(listing);
    
    // Notify clients of change
    const io = req.app.get('socketio');
    if (io) {
      io.emit('listing_status_change', formatted);
    }
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
