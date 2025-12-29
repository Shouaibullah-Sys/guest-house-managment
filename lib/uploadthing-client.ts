// lib/uploadthing-client.ts - Client configuration for UploadThing
import { genUploader } from "uploadthing/client";
import type { FileRouter } from "uploadthing/types";

// Simple type definition for our upload routes
type SimpleFileRouter = FileRouter;

// Generate a typed uploader with URL configuration
export const uploadFiles = genUploader<SimpleFileRouter>({
  url: "/api/uploadthing",
});
