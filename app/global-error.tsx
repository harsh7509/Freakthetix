// app/global-error.tsx
'use client';
export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body className="p-8">
        <h1 className="text-2xl font-bold">App crashed</h1>
        <pre className="mt-4 whitespace-pre-wrap text-red-300">{error?.message}</pre>
      </body>
    </html>
  );
}
