export default function Loading() {
  return (
    <main className="grid gap-6">
      <div className="text-center">
        <div className="h-8 w-56 mx-auto skeleton" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-28 skeleton" />
        <div className="h-28 skeleton" />
      </div>
    </main>
  );
}
