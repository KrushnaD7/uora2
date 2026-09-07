"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, AlertCircle } from "lucide-react";
import UserModal from "@/components/admin/UserModal";
import { api } from "@/lib/api/client";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await api.get("/users");
      if (data.success && data.data) {
        setUsers(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (userData: any) => {
    setModalLoading(true);
    try {
      // If updating, don't send empty password
      if (selectedUser && !userData.password) {
        delete userData.password;
      }
      
      const res = selectedUser 
        ? await api.patch(`/users/${selectedUser.id}`, userData)
        : await api.post("/users", userData);
        
      if (!res.success) throw new Error(res.message);
      
      setIsModalOpen(false);
      fetchUsers(); // Refresh table
    } catch (err: any) {
      alert(err.message || "Failed to save user");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const res = await api.delete(`/users/${id}`);
      if (!res.success) throw new Error(res.message);
      
      fetchUsers(); // Refresh table
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };
  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const colors: any = {
      ADMIN: "bg-red-50 text-red-600 border-red-100",
      EDITOR: "bg-purple-50 text-purple-600 border-purple-100",
      REVIEWER: "bg-blue-50 text-blue-600 border-blue-100",
      AUTHOR: "bg-green-50 text-green-600 border-green-100"
    };
    return `px-3 py-1 rounded-full text-xs font-bold border ${colors[role] || "bg-slate-50 text-slate-600"}`;
  };

  const getStatusBadge = (status: string) => {
    return status === "ACTIVE" 
      ? "text-green-500 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold"
      : "text-red-500 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold";
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system roles and access control.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#0B8A83] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#09756f] transition-colors shadow-sm"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
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
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Joined Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={getRoleBadge(user.role)}>{user.role}</span>
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadge(user.status)}>{user.status}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
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

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialData={selectedUser}
        loading={modalLoading}
      />
    </div>
  );
}
