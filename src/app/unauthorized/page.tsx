export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-red-600">403 - Unauthorized</h1>
      <p className="mt-4 text-lg">You do not have permission to view this page.</p>
      <a href="/" className="mt-6 text-blue-500 hover:underline">
        Go Home
      </a>
    </div>
  );
}