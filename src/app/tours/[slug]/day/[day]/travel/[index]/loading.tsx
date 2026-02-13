export default function Loading() {
  return (
    <main className="grid gap-6">
      <div className="text-center">
        <div className="h-8 w-72 mx-auto skeleton" />
      </div>
      <div className="h-28 skeleton" />
      <div className="h-24 skeleton" />
    </main>
  );
}
