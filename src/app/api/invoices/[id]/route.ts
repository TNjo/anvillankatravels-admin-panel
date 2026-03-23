import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";

const COLLECTION = "invoices";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const docRef = adminDb.collection(COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const data = await request.json();
    const docRef = adminDb.collection(COLLECTION).doc(id);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.items) {
      updateData.items = data.items;
      const subtotal = data.items.reduce(
        (sum: number, item: { total: number }) => sum + (item.total || 0),
        0
      );
      updateData.subtotal = subtotal;
      
      const taxRate = data.taxRate ?? (await docRef.get()).data()?.taxRate ?? 0;
      const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
      updateData.taxAmount = taxAmount;
      
      const discountAmount = data.discountAmount ?? (await docRef.get()).data()?.discountAmount ?? 0;
      updateData.totalAmount = subtotal + taxAmount - discountAmount;
      
      const amountPaid = data.amountPaid ?? (await docRef.get()).data()?.amountPaid ?? 0;
      updateData.balanceDue = updateData.totalAmount as number - amountPaid;
    }

    const allowedFields = [
      "customerName",
      "customerEmail",
      "customerPhone",
      "customerAddress",
      "customerCountry",
      "tourName",
      "tourType",
      "tourDates",
      "taxRate",
      "discountAmount",
      "discountDescription",
      "currency",
      "amountPaid",
      "status",
      "dueDate",
      "notes",
      "terms",
      "issuedDate",
      "paidDate",
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    if (data.amountPaid !== undefined) {
      const doc = await docRef.get();
      const currentData = doc.data();
      if (currentData) {
        updateData.balanceDue = currentData.totalAmount - data.amountPaid;
        if (data.amountPaid >= currentData.totalAmount) {
          updateData.status = "paid";
          updateData.paidDate = new Date().toISOString().split("T")[0];
        } else if (data.amountPaid > 0) {
          updateData.status = "partially-paid";
        }
      }
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const docRef = adminDb.collection(COLLECTION).doc(id);
    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
