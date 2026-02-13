export default function Loading() {
  return (
    <main className="grid gap-6">
      <div className="text-center">
        <div className="h-8 w-72 mx-auto skeleton" />
        <div className="h-4 w-40 mx-auto mt-2 skeleton" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-24 skeleton" />
        <div className="h-24 skeleton" />
      </div>
    </main>
  );
}
