// app/api/hero-section/upload/route.ts
import { auth } from "@clerk/nextjs/server";
import { createUploadthing } from "uploadthing/server";

// Create UploadThing instance
const f = createUploadthing();

// UploadThing file router for hero section images
export const ourFileRouter = {
  // Define the upload endpoint for hero sections
  heroSectionUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // Authentication check
      const { userId } = await auth();
      if (!userId) {
        throw new Error("Unauthorized");
      }
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload
      console.log("Upload complete for user:", metadata.userId);
      console.log("File URL:", file.url);

      // Return the file data that will be sent to the client
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),
};

// Export the handler for UploadThing to use
export type OurFileRouter = typeof ourFileRouter;
