import Link from "next/link";
import TourForm from "@/components/admin/TourForm";

export default function EditTourPage({ params }: { params: { id: string } }) {
  return (
    <main>
      <section className="page-hero">
        <p className="page-kicker">Админка</p>
        <h2 className="page-title mt-2">Редактирование тура</h2>
        <Link className="text-xs text-soft hover:underline mt-2 inline-block" href="/admin/tours">
          Назад к списку
        </Link>
      </section>

      <section className="section">
        <TourForm mode="edit" tourId={params.id} />
      </section>
    </main>
  );
}
