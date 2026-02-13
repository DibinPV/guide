export default function Loading() {
  return (
    <main className="grid gap-6">
      <div className="text-center">
        <div className="h-8 w-72 mx-auto skeleton" />
      </div>
      <div className="h-80 skeleton" />
      <div className="grid gap-2">
        <div className="h-16 skeleton" />
        <div className="h-16 skeleton" />
      </div>
    </main>
  );
}
