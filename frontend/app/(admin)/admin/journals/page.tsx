"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Search, AlertCircle, X, BookOpen, ExternalLink } from "lucide-react";
import { api } from "@/lib/api/client";
import Link from "next/link";

interface JournalSettings {
  about?: string | null;
  aimsScope?: string | null;
  ethics?: string | null;
  guidelines?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
}

interface Journal {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  subdomain: string;
  issn?: string | null;
  eissn?: string | null;
  email?: string | null;
  phone?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  settings?: JournalSettings | null;
}

const EMPTY_SETTINGS: JournalSettings = {
  about: "",
  aimsScope: "",
  ethics: "",
  guidelines: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  facebook: "",
  twitter: "",
  linkedin: "",
};

type ModalTab = "details" | "content";

export default function AdminJournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("details");
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    slug: "",
    subdomain: "",
    issn: "",
    eissn: "",
    email: "",
    phone: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });
  const [settingsData, setSettingsData] = useState<JournalSettings>(EMPTY_SETTINGS);

  const fetchJournals = async () => {
    try {
      const res = await api.get("/journals");
      if (res.success && res.data) {
        setJournals(Array.isArray(res.data) ? res.data : (res as any).data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const openCreateModal = () => {
    setSelectedJournal(null);
    setActiveTab("details");
    setFormData({
      name: "",
      shortName: "",
      slug: "",
      subdomain: "",
      issn: "",
      eissn: "",
      email: "",
      phone: "",
      status: "ACTIVE",
    });
    setSettingsData(EMPTY_SETTINGS);
    setIsModalOpen(true);
  };

  const openEditModal = async (journal: Journal) => {
    setSelectedJournal(journal);
    setActiveTab("details");
    setFormData({
      name: journal.name,
      shortName: journal.shortName,
      slug: journal.slug,
      subdomain: journal.subdomain,
      issn: journal.issn || "",
      eissn: journal.eissn || "",
      email: journal.email || "",
      phone: journal.phone || "",
      status: journal.status,
    });
    setSettingsData(EMPTY_SETTINGS);
    setIsModalOpen(true);

    // The journals list endpoint doesn't include the settings relation
    // (About / Aims & Scope / Ethics / Guidelines / contact / socials),
    // so fetch the full journal record for the edit modal.
    setSettingsLoading(true);
    try {
      const res = await api.get(`/journals/${journal.id}`);
      const full = (res as any).data as Journal;
      if (res.success && full?.settings) {
        setSettingsData({
          about: full.settings.about || "",
          aimsScope: full.settings.aimsScope || "",
          ethics: full.settings.ethics || "",
          guidelines: full.settings.guidelines || "",
          contactEmail: full.settings.contactEmail || "",
          contactPhone: full.settings.contactPhone || "",
          address: full.settings.address || "",
          facebook: full.settings.facebook || "",
          twitter: full.settings.twitter || "",
          linkedin: full.settings.linkedin || "",
        });
      }
    } catch {
      // Non-fatal — settings tab just starts blank if this fails.
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload: any = { ...formData };
      // Remove empty optional fields
      if (!payload.issn) delete payload.issn;
      if (!payload.eissn) delete payload.eissn;
      if (!payload.email) delete payload.email;
      if (!payload.phone) delete payload.phone;

      const res = selectedJournal
        ? await api.patch(`/journals/${selectedJournal.id}`, payload)
        : await api.post("/journals", payload);

      if (!res.success) throw new Error(res.message);

      // Resolve the journal id to save the Content & Settings tab against:
      // for an edit this is the existing journal, for a new journal it's
      // the id the create call just returned.
      const journalId = selectedJournal ? selectedJournal.id : (res as any).data?.id;

      if (journalId) {
        const settingsPayload: any = { ...settingsData };
        if (!settingsPayload.contactEmail) settingsPayload.contactEmail = "";
        await api.patch(`/journals/${journalId}/settings`, settingsPayload);
      }

      setIsModalOpen(false);
      fetchJournals();
    } catch (err: any) {
      alert(err.message || "Failed to save journal");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this journal?")) return;
    try {
      const res = await api.delete(`/journals/${id}`);
      if (!res.success) throw new Error(res.message);
      fetchJournals();
    } catch (err: any) {
      alert(err.message || "Failed to delete journal");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const filteredJournals = journals.filter(
    (j) =>
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.shortName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Journal Management</h1>
          <p className="text-slate-500 mt-1">Create and manage academic journals on the platform.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#0B8A83] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#09756f] transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Journal
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search journals..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0B8A83] transition-colors text-sm"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-8 text-center flex flex-col items-center text-red-500">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Journal</th>
                  <th className="p-4 font-semibold">ISSN / eISSN</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Created</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading journals...</td>
                  </tr>
                ) : filteredJournals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                      No journals found.
                    </td>
                  </tr>
                ) : (
                  filteredJournals.map((journal) => (
                    <tr key={journal.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <Link href={`/admin/journals/${journal.id}/workspace`} className="font-semibold text-slate-900 hover:text-[#0B8A83] transition-colors inline-block">
                          {journal.name}
                        </Link>
                        <p className="text-sm text-slate-500">{journal.shortName} • {journal.slug}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-700">{journal.issn || "—"}</p>
                        <p className="text-xs text-slate-400">{journal.eissn ? `e: ${journal.eissn}` : ""}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            journal.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {journal.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(journal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={`/journals/${journal.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors mr-2 inline-block"
                          title="Preview Journal"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <Link
                          href={`/admin/journals/${journal.id}/workspace`}
                          className="p-2 text-[#0B8A83] hover:bg-[#DDF6F4] rounded-lg transition-colors mr-2 inline-block"
                          title="Manage Workspace"
                        >
                          <BookOpen size={16} />
                        </Link>
                        <button
                          onClick={() => openEditModal(journal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(journal.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedJournal ? "Edit Journal" : "Create New Journal"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-6 pt-4 border-b border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                    activeTab === "details"
                      ? "text-[#0B8A83] border-b-2 border-[#0B8A83]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Journal Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                    activeTab === "content"
                      ? "text-[#0B8A83] border-b-2 border-[#0B8A83]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Content &amp; Settings
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {activeTab === "details" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Journal Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setFormData({
                              ...formData,
                              name,
                              slug: generateSlug(name),
                              subdomain: generateSlug(name),
                            });
                          }}
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                          placeholder="Journal of Advanced Research"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Short Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.shortName}
                            onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="JAR"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Slug *</label>
                          <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="journal-of-advanced-research"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Subdomain *</label>
                        <input
                          type="text"
                          required
                          value={formData.subdomain}
                          onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                          placeholder="jar"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">ISSN</label>
                          <input
                            type="text"
                            value={formData.issn}
                            onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="1234-5678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">eISSN</label>
                          <input
                            type="text"
                            value={formData.eissn}
                            onChange={(e) => setFormData({ ...formData, eissn: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="8765-4321"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                          <input
                            type="email"
                            suppressHydrationWarning
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="journal@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                          <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] bg-white transition-all"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                      </div>
                    </>
                  )}

                  {activeTab === "content" && (
                    <>
                      {!selectedJournal && (
                        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                          Fill these in now and they'll be saved once the journal is created — or come back and edit them anytime from this tab.
                        </div>
                      )}
                      {settingsLoading && (
                        <p className="text-sm text-slate-400">Loading content...</p>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">About</label>
                        <textarea
                          rows={3}
                          value={settingsData.about || ""}
                          onChange={(e) => setSettingsData({ ...settingsData, about: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all resize-y"
                          placeholder="A short introduction to the journal shown on its public page."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Aims &amp; Scope</label>
                        <textarea
                          rows={5}
                          value={settingsData.aimsScope || ""}
                          onChange={(e) => setSettingsData({ ...settingsData, aimsScope: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all resize-y"
                          placeholder="Describes the subject areas and article types the journal publishes."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Publication Ethics</label>
                        <textarea
                          rows={5}
                          value={settingsData.ethics || ""}
                          onChange={(e) => setSettingsData({ ...settingsData, ethics: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all resize-y"
                          placeholder="The journal's peer-review process and ethical standards."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Author Guidelines</label>
                        <textarea
                          rows={5}
                          value={settingsData.guidelines || ""}
                          onChange={(e) => setSettingsData({ ...settingsData, guidelines: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all resize-y"
                          placeholder="Formatting, submission and manuscript preparation instructions for authors."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Email</label>
                          <input
                            type="email"
                            suppressHydrationWarning
                            value={settingsData.contactEmail || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, contactEmail: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="editor@journal.example"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Phone</label>
                          <input
                            type="text"
                            value={settingsData.contactPhone || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, contactPhone: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                        <input
                          type="text"
                          value={settingsData.address || ""}
                          onChange={(e) => setSettingsData({ ...settingsData, address: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                          placeholder="Editorial office address"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Facebook</label>
                          <input
                            type="text"
                            value={settingsData.facebook || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, facebook: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Twitter / X</label>
                          <input
                            type="text"
                            value={settingsData.twitter || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, twitter: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="https://x.com/..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">LinkedIn</label>
                          <input
                            type="text"
                            value={settingsData.linkedin || ""}
                            onChange={(e) => setSettingsData({ ...settingsData, linkedin: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                            placeholder="https://linkedin.com/company/..."
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 justify-end p-6 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#0B8A83] hover:bg-[#09756f] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {modalLoading ? "Saving..." : "Save Journal"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
