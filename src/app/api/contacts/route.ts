import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import type { Contact } from "@/types";

const COLLECTION = "contacts";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION)
      .orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const contacts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Contact[];

    return Response.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return Response.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const contactData: Omit<Contact, "id"> = {
      ...body,
      status: "unread",
      createdAt: now,
    };

    const docRef = await adminDb.collection(COLLECTION).add(contactData);

    return Response.json({ id: docRef.id, ...contactData }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return Response.json({ error: "Failed to submit contact" }, { status: 500 });
  }
}
