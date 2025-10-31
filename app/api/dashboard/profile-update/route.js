// import { connectDB } from "@/lib/db.config";
// import userModel from "@/models/user.model";

// import bcrypt from "bcryptjs";
// import NextAuth, { getServerSession } from "next-auth";
// import { NextResponse } from "next/server";


// export async function PUT(request) {
  
//   await connectDB();

//   const session = await getServerSession(NextAuth);
//   if (!session) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 401 }
//     );
  

//   try {
//     const { name, password } = await request.json();

//     const user = await userModel.findOne({ email: session.user.email });
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 }
//       );
//     }

//     if (name) user.name = name;
//     if (password) user.password = await bcrypt.hash(password, 10);

//     await user.save();

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }
