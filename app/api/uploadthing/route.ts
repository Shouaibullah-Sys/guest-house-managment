// app/api/uploadthing/route.ts
import { auth } from "@clerk/nextjs/server";
import { createUploadthing } from "uploadthing/server";
import { createRouteHandler } from "uploadthing/next";

// Create UploadThing instance
const f = createUploadthing();

// Generic file router for general uploads
export const ourFileRouter = {
  // Hero section uploader (for compatibility with existing client)
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
      console.log("Hero section upload complete for user:", metadata.userId);
      console.log("File URL:", file.ufsUrl);

      // Return the file data that will be sent to the client
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),

  // Define a general image uploader
  imageUploader: f({
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

  // Room uploader
  roomUploader: f({
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
      console.log("Room upload complete for user:", metadata.userId);
      console.log("File URL:", file.ufsUrl);

      // Return the file data that will be sent to the client
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),

  // Document uploader
  documentUploader: f({
    "application/pdf": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    "application/msword": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "8MB",
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
      console.log("Document upload complete for user:", metadata.userId);
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

// Export HTTP handlers using the UploadThing server SDK
export const { POST, GET } = createRouteHandler({
  router: ourFileRouter,
});
