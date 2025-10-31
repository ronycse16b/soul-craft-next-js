// app/api/advertisement/route.js
import { connectDB } from "@/lib/db.config";
import Advertisement from "@/models/advertisement.model";


// GET All (Public)
export async function GET() {
  await connectDB();
  const ads = await Advertisement.find({isActive: true}).sort({
    createdAt: -1,
  });
  return Response.json(ads);
}

// POST (Admin Create)
export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const newAd = await Advertisement.create(data);
  return Response.json(newAd);
}
