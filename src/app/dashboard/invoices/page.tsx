"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Send,
  Download,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { Invoice, InvoiceItem, Booking } from "@/types";
import InvoicePreview from "@/components/InvoicePreview";

const STATUS_OPTIONS = ["draft", "sent", "paid", "partially-paid", "overdue", "cancelled"] as const;

const statusBadge: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "partially-paid": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

const statusIcon: Record<string, React.ReactNode> = {
  draft: <FileText className="h-3.5 w-3.5" />,
  sent: <Send className="h-3.5 w-3.5" />,
  paid: <CheckCircle className="h-3.5 w-3.5" />,
  "partially-paid": <Clock className="h-3.5 w-3.5" />,
  overdue: <AlertCircle className="h-3.5 w-3.5" />,
  cancelled: <X className="h-3.5 w-3.5" />,
};

export default function InvoicesPage() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<Invoice> | null>(null);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      const data: Partial<Invoice> = {};
      const bookingId = searchParams.get("bookingId");
      if (bookingId) data.bookingId = bookingId;
      
      const customerName = searchParams.get("customerName");
      if (customerName) data.customerName = customerName;
      
      const customerEmail = searchParams.get("customerEmail");
      if (customerEmail) data.customerEmail = customerEmail;
      
      const customerPhone = searchParams.get("customerPhone");
      if (customerPhone) data.customerPhone = customerPhone;
      
      const customerCountry = searchParams.get("customerCountry");
      if (customerCountry) data.customerCountry = customerCountry;
      
      const tourName = searchParams.get("tourName");
      if (tourName) data.tourName = tourName;
      
      const tourType = searchParams.get("tourType") as Invoice["tourType"];
      if (tourType) data.tourType = tourType;
      
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      if (startDate) data.tourDates = { start: startDate, end: endDate || "" };
      
      const totalPrice = searchParams.get("totalPrice");
      const depositPaid = searchParams.get("depositPaid");
      const currency = searchParams.get("currency") || "USD";
      
      if (totalPrice) {
        data.items = [{
          description: `${tourName || "Tour"} - Tour Package`,
          quantity: 1,
          unitPrice: parseFloat(totalPrice),
          total: parseFloat(totalPrice),
        }];
        data.amountPaid = depositPaid ? parseFloat(depositPaid) : 0;
      }
      
      data.currency = currency;
      
      setPrefillData(data);
      setIsModalOpen(true);
      
      window.history.replaceState({}, "", "/dashboard/invoices");
    }
  }, [searchParams]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const url = filterStatus !== "all" 
        ? `/api/invoices?status=${filterStatus}` 
        : "/api/invoices";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInvoices(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchBookings();
  }, [filterStatus]);

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setInvoices(invoices.filter((inv) => inv.id !== id));
        toast.success("Invoice deleted successfully");
      } else {
        toast.error("Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSave = async (data: Partial<Invoice>) => {
    try {
      const token = await getToken();
      const url = editingInvoice 
        ? `/api/invoices/${editingInvoice.id}` 
        : "/api/invoices";
      const method = editingInvoice ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingInvoice ? "Invoice updated" : "Invoice created");
        fetchInvoices();
        setIsModalOpen(false);
        setEditingInvoice(null);
      } else {
        toast.error("Failed to save invoice");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  const handleMarkAsSent = async (invoice: Invoice) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "sent" }),
      });

      if (res.ok) {
        toast.success("Invoice marked as sent");
        fetchInvoices();
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "paid", 
          amountPaid: invoice.totalAmount,
          paidDate: new Date().toISOString().split("T")[0]
        }),
      });

      if (res.ok) {
        toast.success("Invoice marked as paid");
        fetchInvoices();
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = search.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customerName.toLowerCase().includes(searchLower) ||
      invoice.customerEmail.toLowerCase().includes(searchLower) ||
      invoice.tourName.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === "draft").length,
    sent: invoices.filter((i) => i.status === "sent").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalRevenue: invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.totalAmount, 0),
    pending: invoices
      .filter((i) => ["sent", "partially-paid"].includes(i.status))
      .reduce((sum, i) => sum + i.balanceDue, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track customer invoices
          </p>
        </div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{stats.paid}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            ${stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Amount</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            ${stats.pending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice #, customer, tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No invoices found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || filterStatus !== "all"
              ? "Try adjusting your search or filter"
              : "Create your first invoice to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[invoice.status]}`}>
                      {statusIcon[invoice.status]}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).replace("-", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {invoice.customerName} • {invoice.tourName}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Issued: {new Date(invoice.issuedDate).toLocaleDateString()}
                    {invoice.dueDate && ` • Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {invoice.currency} {invoice.totalAmount.toLocaleString()}
                    </p>
                    {invoice.balanceDue > 0 && invoice.status !== "paid" && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Balance: {invoice.currency} {invoice.balanceDue.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewInvoice(invoice)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {invoice.status === "draft" && (
                      <button
                        onClick={() => handleMarkAsSent(invoice)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700 dark:hover:text-green-400"
                        title="Mark as Sent"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    {["sent", "partially-paid"].includes(invoice.status) && (
                      <button
                        onClick={() => handleMarkAsPaid(invoice)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700 dark:hover:text-green-400"
                        title="Mark as Paid"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingInvoice(invoice);
                        setIsModalOpen(true);
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(invoice.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Invoice</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
          setPrefillData(null);
        }}
        onSave={handleSave}
        invoice={editingInvoice}
        bookings={bookings}
        prefillData={prefillData}
      />

      {/* Invoice Preview */}
      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          onStatusUpdate={(updatedInvoice) => {
            setInvoices(invoices.map((inv) => 
              inv.id === updatedInvoice.id ? updatedInvoice : inv
            ));
            setPreviewInvoice(updatedInvoice);
          }}
        />
      )}
    </div>
  );
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Invoice>) => Promise<void>;
  invoice: Invoice | null;
  bookings: Booking[];
  prefillData?: Partial<Invoice> | null;
}

function InvoiceModal({ isOpen, onClose, onSave, invoice, bookings, prefillData }: InvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerCountry: "",
    tourName: "",
    tourType: "custom" as Invoice["tourType"],
    tourDates: { start: "", end: "" } as { start: string; end?: string },
    items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[],
    taxRate: 0,
    discountAmount: 0,
    discountDescription: "",
    currency: "USD",
    amountPaid: 0,
    status: "draft" as Invoice["status"],
    dueDate: "",
    notes: "",
    terms: "Payment is due within 14 days of invoice date.",
    issuedDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        customerName: invoice.customerName || "",
        customerEmail: invoice.customerEmail || "",
        customerPhone: invoice.customerPhone || "",
        customerAddress: invoice.customerAddress || "",
        customerCountry: invoice.customerCountry || "",
        tourName: invoice.tourName || "",
        tourType: invoice.tourType || "custom",
        tourDates: invoice.tourDates || { start: "", end: "" },
        items: invoice.items?.length ? invoice.items : [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
        taxRate: invoice.taxRate || 0,
        discountAmount: invoice.discountAmount || 0,
        discountDescription: invoice.discountDescription || "",
        currency: invoice.currency || "USD",
        amountPaid: invoice.amountPaid || 0,
        status: invoice.status || "draft",
        dueDate: invoice.dueDate || "",
        notes: invoice.notes || "",
        terms: invoice.terms || "Payment is due within 14 days of invoice date.",
        issuedDate: invoice.issuedDate || new Date().toISOString().split("T")[0],
      });
      setSelectedBookingId(invoice.bookingId || "");
    } else if (prefillData) {
      setFormData({
        customerName: prefillData.customerName || "",
        customerEmail: prefillData.customerEmail || "",
        customerPhone: prefillData.customerPhone || "",
        customerAddress: prefillData.customerAddress || "",
        customerCountry: prefillData.customerCountry || "",
        tourName: prefillData.tourName || "",
        tourType: prefillData.tourType || "custom",
        tourDates: prefillData.tourDates || { start: "", end: "" },
        items: prefillData.items?.length ? prefillData.items : [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
        taxRate: prefillData.taxRate || 0,
        discountAmount: prefillData.discountAmount || 0,
        discountDescription: prefillData.discountDescription || "",
        currency: prefillData.currency || "USD",
        amountPaid: prefillData.amountPaid || 0,
        status: "draft",
        dueDate: prefillData.dueDate || "",
        notes: prefillData.notes || "",
        terms: prefillData.terms || "Payment is due within 14 days of invoice date.",
        issuedDate: new Date().toISOString().split("T")[0],
      });
      setSelectedBookingId(prefillData.bookingId || "");
    } else {
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        customerCountry: "",
        tourName: "",
        tourType: "custom",
        tourDates: { start: "", end: "" },
        items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
        taxRate: 0,
        discountAmount: 0,
        discountDescription: "",
        currency: "USD",
        amountPaid: 0,
        status: "draft",
        dueDate: "",
        notes: "",
        terms: "Payment is due within 14 days of invoice date.",
        issuedDate: new Date().toISOString().split("T")[0],
      });
      setSelectedBookingId("");
    }
  }, [invoice, isOpen, prefillData]);

  const handleBookingSelect = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setFormData((prev) => ({
        ...prev,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone || "",
        customerCountry: booking.customerCountry || "",
        tourName: booking.tourName,
        tourType: booking.tourType,
        tourDates: {
          start: booking.preferredDate,
          end: booking.endDate || "",
        },
        items: booking.totalPrice
          ? [{ description: `${booking.tourName} - Tour Package`, quantity: 1, unitPrice: booking.totalPrice, total: booking.totalPrice }]
          : prev.items,
        amountPaid: booking.depositPaid || 0,
      }));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      }
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, total: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = formData.taxRate ? subtotal * (formData.taxRate / 100) : 0;
  const total = subtotal + taxAmount - formData.discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        bookingId: selectedBookingId || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {invoice ? "Edit Invoice" : "Create Invoice"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Link to Booking */}
          {!invoice && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Link to Booking (Optional)
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => handleBookingSelect(e.target.value)}
                className="input"
              >
                <option value="">Select a booking to auto-fill...</option>
                {bookings
                  .filter((b) => b.status !== "cancelled")
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.customerName} - {b.tourName} ({new Date(b.preferredDate).toLocaleDateString()})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Customer Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.customerCountry}
                  onChange={(e) => setFormData({ ...formData, customerCountry: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </label>
              <textarea
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                className="input min-h-[60px]"
              />
            </div>
          </div>

          {/* Tour Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tour Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tour Name *
                </label>
                <input
                  type="text"
                  value={formData.tourName}
                  onChange={(e) => setFormData({ ...formData, tourName: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tour Type
                </label>
                <select
                  value={formData.tourType}
                  onChange={(e) => setFormData({ ...formData, tourType: e.target.value as Invoice["tourType"] })}
                  className="input"
                >
                  <option value="multi-day">Multi-day Tour</option>
                  <option value="day-tour">Day Tour</option>
                  <option value="custom">Custom Tour</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.tourDates.start}
                  onChange={(e) => setFormData({ ...formData, tourDates: { ...formData.tourDates, start: e.target.value } })}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.tourDates.end}
                  onChange={(e) => setFormData({ ...formData, tourDates: { ...formData.tourDates, end: e.target.value } })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Invoice Items
            </h3>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="input"
                      placeholder="Description"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                      className="input text-center"
                      placeholder="Qty"
                      min="1"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="input"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="text"
                      value={item.total.toFixed(2)}
                      className="input bg-gray-50 dark:bg-gray-700"
                      readOnly
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                    disabled={formData.items.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount Amount
                </label>
                <input
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formData.currency} {subtotal.toFixed(2)}</span>
              </div>
              {formData.taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax ({formData.taxRate}%)</span>
                  <span className="text-gray-900 dark:text-white">{formData.currency} {taxAmount.toFixed(2)}</span>
                </div>
              )}
              {formData.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <span className="text-red-600 dark:text-red-400">-{formData.currency} {formData.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">{formData.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount Paid
              </label>
              <input
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                className="input"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="LKR">LKR</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input min-h-[60px]"
              placeholder="Additional notes for the customer..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {invoice ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
