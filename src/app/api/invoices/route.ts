import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

const COLLECTION = "invoices";

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("invoiceNumber", ">=", prefix)
    .where("invoiceNumber", "<", prefix + "\uf8ff")
    .orderBy("invoiceNumber", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    return `${prefix}0001`;
  }

  const lastInvoice = snapshot.docs[0].data();
  const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0");
  const newNumber = (lastNumber + 1).toString().padStart(4, "0");
  return `${prefix}${newNumber}`;
}

export async function GET(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "invoices");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const bookingId = searchParams.get("bookingId");

    let query: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION)
      .orderBy("createdAt", "desc");

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    if (bookingId) {
      query = query.where("bookingId", "==", bookingId);
    }

    const snapshot = await query.get();
    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "invoices");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const data = await request.json();
    const now = new Date().toISOString();
    const invoiceNumber = await generateInvoiceNumber();

    const subtotal = data.items?.reduce(
      (sum: number, item: { total: number }) => sum + (item.total || 0),
      0
    ) || 0;
    
    const taxAmount = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
    const discountAmount = data.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;
    const amountPaid = data.amountPaid || 0;
    const balanceDue = totalAmount - amountPaid;

    const invoiceData = {
      invoiceNumber,
      bookingId: data.bookingId,
      bookingRef: data.bookingRef || null,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || null,
      customerAddress: data.customerAddress || null,
      customerCountry: data.customerCountry || null,
      tourName: data.tourName,
      tourType: data.tourType || "custom",
      tourDates: data.tourDates || { start: now },
      items: data.items || [],
      subtotal,
      taxRate: data.taxRate || null,
      taxAmount,
      discountAmount,
      discountDescription: data.discountDescription || null,
      totalAmount,
      currency: data.currency || "USD",
      amountPaid,
      balanceDue,
      status: data.status || "draft",
      dueDate: data.dueDate || null,
      notes: data.notes || null,
      terms: data.terms || "Payment is due within 14 days of invoice date.",
      issuedDate: data.issuedDate || now.split("T")[0],
      paidDate: null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection(COLLECTION).add(invoiceData);

    return NextResponse.json({ id: docRef.id, ...invoiceData }, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
