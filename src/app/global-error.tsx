"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">
              Une erreur est survenue
            </h1>
            <p className="text-muted-foreground">
              Quelque chose s&apos;est mal passé. Vous pouvez réessayer.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Réessayer
          </button>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Détails de l&apos;erreur
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
                {error.stack && (
                  <div className="mt-2 text-muted-foreground">{error.stack}</div>
                )}
                {error.digest && (
                  <div className="mt-2 text-muted-foreground">Digest: {error.digest}</div>
                )}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
