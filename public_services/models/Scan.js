import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  cropName: String,
  diseaseName: String,
}, { timestamps: true });

const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);
export default Scan;
