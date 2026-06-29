import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

interface NotFoundProps {
  title?: string;
  message?: string;
}

export function NotFound({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or may have moved.",
}: NotFoundProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 px-6 text-center">
      <p className="text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-blue-500 to-purple-600">
        404
      </p>
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="mt-2 max-w-md text-zinc-400">{message}</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        <Home size={18} />
        Back home
      </Link>
    </div>
  );
}
