import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Админка</p>
            <h2 className="mt-2 text-h2">Управление контентом</h2>
            <p className="text-sm text-soft mt-1">Создание и редактирование туров.</p>
          </div>
          <AdminNav />
        </div>
      </div>
      {children}
    </div>
  );
}
