import { NextRequest } from "next/server";
import { adminStorage } from "@/lib/firebase-admin";
import { verifyAnyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { user, authorized } = await verifyAnyAdminPermission(request);
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${extension}`;

    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return Response.json({ url: publicUrl, fileName });
  } catch (error) {
    console.error("Error uploading file:", error);
    return Response.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
