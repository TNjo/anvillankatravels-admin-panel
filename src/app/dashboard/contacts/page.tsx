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
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { Contact } from "@/types";

export default function ContactsPage() {
  const { getToken } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/contacts", {
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

      setContacts(
        contacts.map((c) =>
          c.id === contact.id ? { ...c, status: "read" } : c
        )
      );
    } catch {
      console.error("Failed to mark as read");
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
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Contact form submissions from visitors
        </p>
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
                <div className="h-5 w-1/3 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
              </div>
            ))
          ) : filteredContacts.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No messages</h3>
              <p className="mt-1 text-sm text-gray-500">
                Messages will appear here when visitors submit the contact form
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => openContact(contact)}
                className={`card w-full text-left transition-colors hover:border-primary-200 ${
                  selected?.id === contact.id ? "border-primary-300 bg-primary-50/50" : ""
                } ${contact.status === "unread" ? "border-l-4 border-l-primary-500" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {contact.status === "unread" ? (
                        <Mail className="h-4 w-4 text-primary-600" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${contact.status === "unread" ? "font-semibold" : "font-medium"} text-gray-900`}>
                        {contact.name}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-700">{contact.subject}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{contact.message}</p>
                  </div>
                  <span className="text-xs text-gray-400">
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
                <h2 className="text-lg font-semibold text-gray-900">{selected.subject}</h2>
                <p className="text-sm text-gray-500">
                  From {selected.name} &middot; {selected.email}
                  {selected.phone && ` &middot; ${selected.phone}`}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {selected.createdAt ? formatDate(selected.createdAt) : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              {selected.message}
            </div>
            <div className="mt-4">
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="btn-primary"
              >
                <Mail className="mr-2 h-4 w-4" />
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
