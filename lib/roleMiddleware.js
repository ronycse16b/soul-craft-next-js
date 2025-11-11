import { getToken } from "next-auth/jwt";
import User from "@/models/user.model";
import { connectDB } from "@/lib/db.config";
import { NextResponse } from "next/server";

export async function verifyAccess(req, { roles = [], permission } = {}) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
    secureCookie: process.env.NODE_ENV === "production",
  });

  console.log("Token:", token);
  console.log("Roles:", roles);
  console.log("Permission:", permission);
  console.log(req);

  if (!token) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }



  await connectDB();
  const user = await User.findById(token.id).select("role permissions");
  if (!user) {
    return new NextResponse(JSON.stringify({ message: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Admin always allowed
  if (user.role === "admin") return user;

  // Role check
  if (roles.length && !roles.includes(user.role)) {
    return new NextResponse(JSON.stringify({ message: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Moderator permission check
  if (user.role === "moderator" && permission) {
    if (!user.permissions || !user.permissions[permission]) {
      return new NextResponse(
        JSON.stringify({ message: "Permission denied" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    return user;
  }

  // Basic user allowed?
  if (user.role === "user" && roles.includes("user")) return user;

  return new NextResponse(JSON.stringify({ message: "Unauthorized access" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

// import { getToken } from "next-auth/jwt";
// import User from "@/models/user.model";
// import { connectDB } from "@/lib/db.config";
// import { NextResponse } from "next/server";

// /**
//  * Role and permission based middleware
//  * @param {Request} req - Incoming request
//  * @param {Object} options - Role & permission config
//  * @param {Array} [options.roles=[]] - Allowed roles (e.g. ["admin", "moderator"])
//  * @param {String} [options.permission] - Specific permission key (e.g. "update", "delete", "read")
//  */
// export async function verifyAccess(req, { roles = [], permission } = {}) {
//   console.log("=== verifyAccess start ===");

//  const token = await getToken({
//   req,
//   secret: process.env.AUTH_SECRET,
//   secureCookie: process.env.NODE_ENV === "production", // ensures __Secure cookie read
// });

//   // console.log("Token:", token);
//   // console.log("Roles:", roles);
//   // console.log("Permission:", permission);
//   // console.log(req)

//   if (!token) {
//     // console.log("No token → Unauthorized");
//     return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
//       status: 401,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   await connectDB();
//   const user = await User.findById(token.id).select("role permissions");
//   // console.log("Fetched user:", user);

//   if (!user) {
//     // console.log("User not found → 404");
//     return new NextResponse(JSON.stringify({ message: "User not found" }), {
//       status: 404,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   // ✅ Admin always allowed
//   if (user.role === "admin") {
//     // console.log("Admin → access granted");
//     return user;
//   }

//   // ✅ Check allowed roles
//   if (roles.length && !roles.includes(user.role)) {
//     // console.log(`Role ${user.role} not allowed → 403`);
//     return new NextResponse(JSON.stringify({ message: "Access denied" }), {
//       status: 403,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   // ✅ Moderator permission check
//   if (user.role === "moderator" && permission) {
//     // console.log("Checking moderator permission:", permission);
//     if (!user.permissions[permission]) {
//       // console.log(`Moderator missing permission "${permission}" → 403`);
//       return new NextResponse(
//         JSON.stringify({ message: "Permission denied" }),
//         {
//           status: 403,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }
//     // console.log(`Moderator has permission "${permission}" → access granted`);
//     return user;
//   }

//   // ✅ Basic users only if allowed
//   if (user.role === "user" && roles.includes("user")) {
//     // console.log("Basic user → access granted");
//     return user;
//   }

//   // console.log("No condition matched → Unauthorized access");
//   return new NextResponse(JSON.stringify({ message: "Unauthorized access" }), {
//     status: 403,
//     headers: { "Content-Type": "application/json" },
//   });
// }
