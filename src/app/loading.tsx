export default function Loading() {
  return (
    <main className="grid gap-6">
      <section className="grid gap-4 text-center">
        <div className="h-10 w-64 mx-auto skeleton" />
        <div className="h-4 w-80 mx-auto skeleton" />
        <div className="flex justify-center gap-3">
          <div className="h-10 w-32 skeleton" />
          <div className="h-10 w-32 skeleton" />
        </div>
      </section>
      <section className="grid gap-4">
        <div className="h-6 w-40 skeleton" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
        </div>
      </section>
    </main>
  );
}
