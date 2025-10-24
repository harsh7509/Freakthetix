// app/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <pre className="mt-4 whitespace-pre-wrap text-red-300">{error?.message}</pre>
      <button className="mt-4 px-4 py-2 bg-white text-black" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
