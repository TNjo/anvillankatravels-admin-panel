"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  MessageSquare,
  Search,
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  X,
  Globe,
  Phone,
  Calendar,
  Package,
  Users,
  Clock,
  Hotel,
  DollarSign,
  MapPin,
  Sparkles,
  Plane,
} from "lucide-react";
import { toast } from "sonner";
import { useRequirePermission } from "@/lib/useRequirePermission";
import { formatDate } from "@/lib/utils";
import type { Contact } from "@/types";

type TabType = "all" | "inquiry" | "tailor-made";

export default function ContactsPage() {
  const { getToken } = useAuth();
  const { authorized, loading: permLoading } = useRequirePermission("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const fetchContacts = async (status?: string, type?: string) => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (type && type !== "all") params.set("type", type);
      const qs = params.toString();
      const url = qs ? `/api/contacts?${qs}` : "/api/contacts";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setContacts(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(filterStatus, activeTab);
  }, [filterStatus, activeTab]);

  if (permLoading || !authorized) return null;

  const markAsRead = async (contact: Contact) => {
    if (contact.status !== "unread") return;

    try {
      const token = await getToken();
      await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "read" }),
      });

      if (filterStatus === "unread") {
        setContacts(contacts.filter((c) => c.id !== contact.id));
      } else {
        setContacts(
          contacts.map((c) =>
            c.id === contact.id ? { ...c, status: "read" } : c
          )
        );
      }
    } catch {
      console.error("Failed to mark as read");
    }
  };

  const markAsReplied = async (contact: Contact) => {
    if (contact.status === "replied") return;

    try {
      const token = await getToken();
      await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "replied" }),
      });

      setContacts(
        contacts.map((c) =>
          c.id === contact.id ? { ...c, status: "replied" as const } : c
        )
      );
      setSelected({ ...contact, status: "replied" });
    } catch {
      console.error("Failed to mark as replied");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setContacts(contacts.filter((c) => c.id !== id));
        if (selected?.id === id) setSelected(null);
        toast.success("Message deleted");
      }
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const openContact = (contact: Contact) => {
    setSelected(contact);
    markAsRead(contact);
  };

  const filteredContacts = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Contact form submissions from visitors
        </p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => { setActiveTab("all"); setSelected(null); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
          }`}
        >
          All Messages
        </button>
        <button
          onClick={() => { setActiveTab("inquiry"); setSelected(null); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "inquiry"
              ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
          }`}
        >
          Inquiries
        </button>
        <button
          onClick={() => { setActiveTab("tailor-made"); setSelected(null); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "tailor-made"
              ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
          }`}
        >
          Tailor Made
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input appearance-none pr-10"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))
          ) : filteredContacts.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No messages</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Messages will appear here when visitors submit the contact form
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => openContact(contact)}
                className={`card w-full text-left transition-colors hover:border-primary-200 dark:hover:border-primary-700 ${
                  selected?.id === contact.id ? "border-primary-300 bg-primary-50/50 dark:border-primary-600 dark:bg-primary-900/20" : ""
                } ${contact.status === "unread" ? "border-l-4 border-l-primary-500" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {contact.status === "unread" ? (
                        <Mail className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      )}
                      <span className={`text-sm ${contact.status === "unread" ? "font-semibold" : "font-medium"} text-gray-900 dark:text-white`}>
                        {contact.name}
                      </span>
                      {contact.type === "inquiry" && (
                        <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-400">
                          Inquiry
                        </span>
                      )}
                      {contact.type === "tailor-made" && (
                        <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-400">
                          Tailor Made
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">{contact.subject}</p>
                    {contact.country && (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        <Globe className="mr-1 inline h-3 w-3" />{contact.country}
                      </p>
                    )}
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{contact.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {contact.createdAt ? formatDate(contact.createdAt) : ""}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {selected && (
          <div className="card sticky top-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.subject}</h2>
                  {selected.type === "inquiry" && (
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                      Inquiry
                    </span>
                  )}
                  {selected.type === "tailor-made" && (
                    <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
                      Tailor Made
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  From {selected.name} &middot; {selected.email}
                  {selected.phone && ` &middot; ${selected.phone}`}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {selected.createdAt ? formatDate(selected.createdAt) : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {(selected.country || selected.whatsapp || selected.dates || selected.selectedPackage) && (
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 p-4">
                {selected.country && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Country</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.country}</p>
                    </div>
                  </div>
                )}
                {selected.whatsapp && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">WhatsApp</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.whatsapp}</p>
                    </div>
                  </div>
                )}
                {selected.dates && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Travel Dates</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.dates}</p>
                    </div>
                  </div>
                )}
                {selected.selectedPackage && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Interested Package</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.selectedPackage}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selected.tailorMade && (
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  Tailor-Made Tour Details
                </h3>
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/20 p-4">
                  {selected.tailorMade.arrivalDate && (
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Arrival</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.tailorMade.arrivalDate}</p>
                      </div>
                    </div>
                  )}
                  {selected.tailorMade.departureDate && (
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Departure</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.tailorMade.departureDate}</p>
                      </div>
                    </div>
                  )}
                  {selected.tailorMade.pickupPlace && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pickup Place</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.tailorMade.pickupPlace}</p>
                      </div>
                    </div>
                  )}
                  {selected.tailorMade.groupSize && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Group Size</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selected.tailorMade.groupSize}</p>
                      </div>
                    </div>
                  )}
                  {selected.tailorMade.numAdults && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Adults</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selected.tailorMade.numAdults}
                          {selected.tailorMade.ageGroupAdults?.length ? ` (${selected.tailorMade.ageGroupAdults.join(", ")})` : ""}
                        </p>
                      </div>
                    </div>
                  )}
                  {selected.tailorMade.numChildren && selected.tailorMade.numChildren !== "0" && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Children</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selected.tailorMade.numChildren}
                          {selected.tailorMade.ageGroupChildren?.length ? ` (${selected.tailorMade.ageGroupChildren.join(", ")})` : ""}
                        </p>
                      </div>
                    </div>
                  )}
                  {selected.tailorMade.tourDuration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.tailorMade.tourDuration}</p>
                      </div>
                    </div>
                  )}
                  {selected.tailorMade.accommodation && (
                    <div className="flex items-center gap-2">
                      <Hotel className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Accommodation</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{selected.tailorMade.accommodation}</p>
                      </div>
                    </div>
                  )}
                  {selected.tailorMade.budgetRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Budget (per person)</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.tailorMade.budgetRange}</p>
                      </div>
                    </div>
                  )}
                </div>
                {selected.tailorMade.interests && selected.tailorMade.interests.length > 0 && (
                  <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/20 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tailorMade.interests.map((interest) => (
                        <span key={interest} className="rounded-full bg-purple-100 dark:bg-purple-900/50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-400 capitalize">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.tailorMade.specialRequirements && (
                  <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/20 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Special Requirements</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selected.tailorMade.specialRequirements}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 text-sm text-gray-700 dark:text-gray-300">
              {selected.message}
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selected.email)}&su=${encodeURIComponent(`Re: ${selected.subject}`)}&body=${encodeURIComponent(`\n\n\n---\nOriginal message from ${selected.name}:\n${selected.message}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                onClick={() => markAsReplied(selected)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Reply via Gmail
              </a>
              {selected.whatsapp && (
                <a
                  href={`https://wa.me/${selected.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                  onClick={() => markAsReplied(selected)}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Reply via WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
