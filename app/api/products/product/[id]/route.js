import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import productModel from "@/models/product.model";
import fs from 'fs';
import { NextResponse } from "next/server";
import path from 'path';


export async function PUT(req, { params }) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
  await connectDB();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const field = searchParams.get("field");

  try {
    const product = await productModel.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (!["isActive", "flashSale", "newArrival"].includes(field)) {
      return NextResponse.json(
        { success: false, message: "Invalid field" },
        { status: 400 }
      );
    }

    // Toggle the field value
    product[field] = !(product[field] === true || product[field] === "true");

    await product.save();

    return NextResponse.json({ success: true, result: product });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


// export async function DELETE(req, { params }) {
//     const auth = await adminOnlyMiddleware(req);
//     if (auth) return auth; // unauthorized
//   await connectDB();
//   const { id } = await params;

//   try {
//     const product = await productModel.findById(id);
//     if (!product) {
//       return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
//     }

//     // Prepare all image paths (thumbnail + images array)
//     const imagePaths = [
//       ...(product.images || []), // array of image paths
//       product.thumbnail,         // single thumbnail
//     ];

//     const extractImagePaths = (html) => {
//       const matches = [...html.matchAll(/<img[^>]+src="([^">]+)"/g)];
//       return matches.map((m) => m[1]); // returns array like ['/desc-images/xyz.jpg']
//     };
    
//     const deleteImagesFromDescription = (descriptionHtml) => {
//       const imagePaths = extractImagePaths(descriptionHtml);

//       for (const imgPath of imagePaths) {
//         const fullPath = path.join(process.cwd(), "uploads", imgPath);
//         if (fs.existsSync(fullPath)) {
//           fs.unlinkSync(fullPath);
//         }
//       }
//     };

//     // Remove each file from /public/uploads
//     imagePaths.forEach((imgPath) => {
//       if (imgPath) {
//         const filePath = path.join(
//           process.cwd(),
//           "uploads",
//           path.basename(imgPath)
//         );
//         if (fs.existsSync(filePath)) {
//           try {
//             fs.unlinkSync(filePath);
//             console.log(`Deleted file: ${filePath}`);
//           } catch (err) {
//             console.error(`Failed to delete ${filePath}: ${err.message}`);
//           }
//         }
//       }
//     });

//     // Delete the product document
//     await productModel.findByIdAndDelete(id);
//     deleteImagesFromDescription(product.description);

//     return NextResponse.json({ success: true, message: "Product and images deleted" });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }

export async function DELETE(req, { params }) {
  const auth = await adminOnlyMiddleware(req);
  if (auth) return auth; // unauthorized

  await connectDB();
  const { id } = await params; // params is an object, no await needed here

  try {
    const product = await productModel.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Extract and delete images inside description BEFORE deleting product
    const extractImagePaths = (html) => {
      if (!html) return [];
      const matches = [...html.matchAll(/<img[^>]+src="([^">]+)"/g)];
      return matches.map((m) => m[1]);
    };
  
    const deleteImagesFromDescription = (descriptionHtml) => {
      const imagePaths = extractImagePaths(descriptionHtml);

      for (const imgPath of imagePaths) {

        const relativePath = imgPath.startsWith("/")
          ? imgPath.substring(1) // uploads/1750489502573-description.jpg
          : imgPath;

        const fullPath = path.join(process.cwd(), relativePath);
        // equivalent to: project-root/uploads/1750489502573-description.jpg

        console.log("Deleting file:", fullPath);

        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
            console.log(`Deleted description image: ${fullPath}`);
          } catch (err) {
            console.error(`Failed to delete ${fullPath}: ${err.message}`);
          }
        } else {
          console.warn(`File not found for deletion: ${fullPath}`);
        }
      }
    };
      


    // Delete description images first
deleteImagesFromDescription(product.description);

    // Prepare product images (thumbnail + images array)
    const imagePaths = [...(product.images || []), product.thumbnail];

    // Delete product images
    for (const imgPath of imagePaths) {
      if (!imgPath) continue;

      // Use basename in case imgPath is a full URL or has folders
      const fileName = path.basename(imgPath);
      const filePath = path.join(process.cwd(), "uploads", fileName);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted product image: ${filePath}`);
        } catch (err) {
          console.error(`Failed to delete ${filePath}: ${err.message}`);
        }
      }
    }

    // Delete product document from DB
    await productModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product and images deleted",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}