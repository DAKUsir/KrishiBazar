import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import YieldListing from '../models/YieldListing.js';
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

// Seed mock listings into the shared collection
export const seedListings = async () => {
  try {
    const count = await YieldListing.countDocuments();
    if (count === 0) {
      const mockListings = [
        {
          crop: 'Tomato',
          quantity: 950,
          unit: 'kg',
          pricePerUnit: 12,
          totalPrice: 11400,
          description: 'Freshly harvested vine tomatoes. Rich color, perfect for local retailers.',
          quality: 'A',
          location: {
            state: 'Karnataka',
            district: 'Kolar',
            village: 'Kolar Gold Fields',
            address: 'Market Yard, Kolar',
            coordinates: { lat: 13.1368, lng: 78.1292 }
          },
          contact: {
            phone: '+919876543210',
            whatsapp: '+919876543210',
            email: 'ramesh.g@gmail.com'
          },
          farmerName: 'Ramesh Gowda',
          isVerifiedFarmer: true,
          status: 'active'
        },
        {
          crop: 'Rice',
          quantity: 500,
          unit: 'kg',
          pricePerUnit: 25,
          totalPrice: 12500,
          description: 'High-quality Sona Masuri paddy. Dry and ready for storage or milling.',
          quality: 'A',
          location: {
            state: 'Karnataka',
            district: 'Mysore',
            village: 'T. Narsipura',
            address: 'APMC Mysore',
            coordinates: { lat: 12.2958, lng: 76.6394 }
          },
          contact: {
            phone: '+918765432109',
            whatsapp: '+918765432109',
            email: 'siddappa.k@gmail.com'
          },
          farmerName: 'Siddappa K.',
          isVerifiedFarmer: true,
          status: 'active'
        },
        {
          crop: 'Potato',
          quantity: 1200,
          unit: 'kg',
          pricePerUnit: 8,
          totalPrice: 9600,
          description: 'Regular size potatoes. Cleaned and packed in 50kg gunny bags.',
          quality: 'B',
          location: {
            state: 'Karnataka',
            district: 'Mandya',
            village: 'Maddur',
            address: 'APMC Maddur',
            coordinates: { lat: 12.5218, lng: 76.8951 }
          },
          contact: {
            phone: '+917654321098',
            whatsapp: '+917654321098',
            email: 'manjunatha.swamy@gmail.com'
          },
          farmerName: 'Manjunatha swamy',
          isVerifiedFarmer: false,
          status: 'active'
        },
        {
          crop: 'Chilli',
          quantity: 600,
          unit: 'kg',
          pricePerUnit: 40,
          totalPrice: 24000,
          description: 'Byadgi red chillies. Moderate heat, extremely rich red natural color scan.',
          quality: 'Organic',
          location: {
            state: 'Karnataka',
            district: 'Belagavi',
            village: 'Gokak',
            address: 'Gokak APMC',
            coordinates: { lat: 15.8497, lng: 74.4977 }
          },
          contact: {
            phone: '+916543210987',
            whatsapp: '+916543210987'
          },
          farmerName: 'Basavaraj Patil',
          isVerifiedFarmer: true,
          status: 'active'
        },
        {
          crop: 'Onion',
          quantity: 1500,
          unit: 'kg',
          pricePerUnit: 18,
          totalPrice: 27000,
          description: 'Medium sized onions. Dry skins, good keeping quality.',
          quality: 'B',
          location: {
            state: 'Karnataka',
            district: 'Chitradurga',
            village: 'Hiriyur',
            address: 'APMC Hiriyur',
            coordinates: { lat: 14.2251, lng: 76.3980 }
          },
          contact: {
            phone: '+915432109876',
            whatsapp: '+915432109876'
          },
          farmerName: 'Anjinappa Gowda',
          isVerifiedFarmer: false,
          status: 'active'
        },
        {
          crop: 'Cotton',
          quantity: 2000,
          unit: 'kg',
          pricePerUnit: 65,
          totalPrice: 130000,
          description: 'Premium long-staple BT cotton. Free from trash and moisture.',
          quality: 'A',
          location: {
            state: 'Karnataka',
            district: 'Dharwad',
            village: 'Navalgund',
            address: 'APMC Dharwad',
            coordinates: { lat: 15.4589, lng: 75.0078 }
          },
          contact: {
            phone: '+914321098765',
            whatsapp: '+914321098765'
          },
          farmerName: 'Mallikarjun Patil',
          isVerifiedFarmer: true,
          status: 'active'
        }
      ];

      await YieldListing.insertMany(mockListings);
      console.log('Successfully seeded 6 YieldListings into shared database!');
    }
  } catch (error) {
    console.error('Error seeding YieldListings:', error);
  }
};

// Map yield listing structure to frontend crop listing structure
function mapListingToClient(listing) {
  const plain = listing.toObject ? listing.toObject() : listing;
  return {
    _id: plain._id,
    crop: plain.crop,
    quantity: plain.quantity,
    price: plain.pricePerUnit,
    location: {
      village: plain.location?.village || plain.location?.address || 'Market Yard',
      district: plain.location?.district || 'Karnataka',
      coordinates: plain.location?.coordinates || { lat: 12.9716, lng: 77.5946 }
    },
    farmer: {
      name: plain.seller?.name || plain.farmerName || 'Farmer Ji',
      phone: plain.contact?.phone || '+919999999999',
      isVerified: plain.isVerifiedFarmer || !!(plain.seller?.farmDetails?.isVerified)
    },
    image: plain.images?.[0] || '',
    harvestDate: plain.createdAt || plain.availableFrom || new Date(),
    shelfLife: plain.availableTo ? Math.round((new Date(plain.availableTo) - new Date(plain.availableFrom)) / (1000 * 60 * 60 * 24)) : 15,
    notes: plain.description || '',
    reports: plain.reports || 0,
    status: plain.status,
    createdAt: plain.createdAt || new Date(),
    distance: plain.distance
  };
}

// GET all active yield listings with filters
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
      if (maxQty) query.quantity.$lte = Number(maxQty);
    }

    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { crop: { $regex: search, $options: 'i' } },
        { 'location.village': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
        { farmerName: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort order
    let sortOption = { createdAt: -1 }; // Newest first by default
    if (sort === 'priceAsc') sortOption = { pricePerUnit: 1 };
    if (sort === 'priceDesc') sortOption = { pricePerUnit: -1 };
    if (sort === 'qtyDesc') sortOption = { quantity: -1 };
    if (sort === 'qtyAsc') sortOption = { quantity: 1 };

    let listings = await YieldListing.find(query).populate('seller', 'name avatar farmDetails').sort(sortOption);

    // Map Mongoose documents to client-compatible listing formats
    let mappedListings = listings.map(mapListingToClient);

    // Geolocation distance filtering
    if (lat && lng) {
      const buyerLat = parseFloat(lat);
      const buyerLng = parseFloat(lng);

      mappedListings = mappedListings.map(listing => {
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
        mappedListings = mappedListings.filter(l => l.distance <= maxD);
      }

      // Sort by distance if sort option is 'distance'
      if (sort === 'distance') {
        mappedListings.sort((a, b) => a.distance - b.distance);
      }
    }

    res.json(mappedListings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET detailed listing
router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await YieldListing.findById(req.params.id).populate('seller', 'name avatar farmDetails');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(mapListingToClient(listing));
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
      isVerified,
      harvestDate,
      shelfLife,
      notes
    } = req.body;

    // Use uploaded file path if available
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
    const images = imagePath ? [imagePath] : [];

    const parsedQty = Number(quantity);
    const parsedPrice = Number(price);

    const newListing = new YieldListing({
      crop,
      quantity: parsedQty,
      unit: 'kg',
      pricePerUnit: parsedPrice,
      totalPrice: parsedQty * parsedPrice,
      description: notes || '',
      images: images,
      quality: 'A',
      location: {
        state: 'Karnataka',
        district: district,
        village: village,
        address: village ? `${village}, ${district}` : district,
        coordinates: {
          lat: Number(lat) || 12.9716, // Default Bangalore coordinates
          lng: Number(lng) || 77.5946
        }
      },
      contact: {
        phone: farmerPhone,
        whatsapp: farmerPhone,
        email: ''
      },
      farmerName: farmerName,
      isVerifiedFarmer: isVerified === 'true' || isVerified === true,
      availableFrom: harvestDate ? new Date(harvestDate) : new Date(),
      availableTo: new Date(Date.now() + (Number(shelfLife) || 5) * 24 * 60 * 60 * 1000) // End date based on shelf life
    });

    const savedListing = await newListing.save();

    // Map to client schema and trigger Socket.io real-time update
    const clientCompatibleListing = mapListingToClient(savedListing);
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_listing', clientCompatibleListing);
    }

    res.status(201).json(clientCompatibleListing);
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
    const listing = await YieldListing.findById(listingId).populate('seller', 'name avatar farmDetails');
    if (listing) {
      const clientCompatible = mapListingToClient(listing);
      console.log(`[SMS Simulation] To ${clientCompatible.farmer.phone}: Hello ${clientCompatible.farmer.name}, buyer ${buyerName} (${buyerPhone}) has expressed interest in buying ${requestedQuantity} kg of your ${clientCompatible.crop} via FarmShield AI!`);

      // Twilio integration
      const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env;
      if (TWILIO_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE) {
        try {
          const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
          await client.messages.create({
            body: `[FarmShield] ${buyerName} (${buyerPhone}) wants to buy ${requestedQuantity}kg of your ${clientCompatible.crop}. Contact them directly to finalize!`,
            from: TWILIO_PHONE,
            to: clientCompatible.farmer.phone
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
    const listing = await YieldListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    listing.reports = (listing.reports || 0) + 1;
    await listing.save();

    console.log(`[ALERT] Listing ${listing._id} (${listing.crop} in ${listing.location?.village}) has been reported! Total reports: ${listing.reports}`);

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

router.post('/auth/otp-verify', (req, res) => {
  const { phone, otp } = req.body;
  if (otp === '123456') {
    const mockVerifiedPhones = ['+919876543210', '+918765432109', '+916543210987', '+914321098765'];
    const isVerified = mockVerifiedPhones.includes(phone);

    res.json({
      success: true,
      farmer: {
        phone,
        name: phone === '+919876543210' ? 'Ramesh Gowda' : 'Farmer Ji',
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
    const listings = await YieldListing.find({
      $or: [
        { 'contact.phone': req.params.phone },
        { farmerName: req.params.phone }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(listings.map(mapListingToClient));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update status (sold / active)
router.put('/listings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await YieldListing.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('seller', 'name avatar farmDetails');
    
    const clientCompatible = mapListingToClient(listing);
    
    // Notify clients of change
    const io = req.app.get('socketio');
    if (io) {
      io.emit('listing_status_change', clientCompatible);
    }
    
    res.json(clientCompatible);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
