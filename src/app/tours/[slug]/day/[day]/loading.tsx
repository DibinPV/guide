export default function Loading() {
  return (
    <main className="grid gap-6">
      <div className="text-center">
        <div className="h-8 w-64 mx-auto skeleton" />
        <div className="h-4 w-32 mx-auto mt-2 skeleton" />
      </div>
      <div className="h-40 skeleton" />
      <div className="grid gap-4">
        <div className="h-40 skeleton" />
        <div className="h-40 skeleton" />
      </div>
    </main>
  );
}
