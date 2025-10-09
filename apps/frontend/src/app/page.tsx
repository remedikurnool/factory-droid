import { APP_NAME } from "@onemedi/shared";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to {APP_NAME}
        </h1>
        <p className="text-center text-xl text-muted-foreground mb-4">
          🏥 Healthcare E-commerce Platform for India
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">💊 Medicines</h2>
            <p className="text-muted-foreground">
              Browse and order medicines with prescription upload
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🧪 Lab Tests</h2>
            <p className="text-muted-foreground">
              Book diagnostic tests with home sample collection
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">👨‍⚕️ Doctors</h2>
            <p className="text-muted-foreground">
              Find and book appointments with specialists
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🏠 Homecare</h2>
            <p className="text-muted-foreground">
              Nursing, physiotherapy, diabetes management
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🚑 Emergency</h2>
            <p className="text-muted-foreground">
              Ambulance booking and blood bank requests
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🛡️ Insurance</h2>
            <p className="text-muted-foreground">
              Health insurance plans purchase
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js 14+ | TypeScript | Tailwind CSS | shadcn/ui
          </p>
        </div>
      </div>
    </main>
  );
}
