import { APP_CONFIG } from '@/config/app';
import { SITE_CONFIG } from '@/config/site';

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-700">
          {APP_CONFIG.name}
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          {SITE_CONFIG.tagline}
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          v{APP_CONFIG.version}
        </p>
      </div>
    </div>
  );
}

export default App;
