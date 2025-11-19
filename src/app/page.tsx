import DownloadFileCard from './_components/DownloadFileCard';
import SendFileCard, { getDownloadUrl } from './_components/SendFileCard';

interface HomeProps {
  searchParams: Promise<{ id?: string; error?: string; verified?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const fileId = params.id;
  const error = params.error;
  const verified = params.verified;

  let downloadUrl: string | undefined;
  let hasError = false;
  let errorMessage = '';
  let showSuccessMessage = false;

  if (fileId && fileId.toLowerCase() !== 'pending') {
    const result = await getDownloadUrl(fileId);
    if (result.success && result.url) {
      downloadUrl = result.url;
      if (verified === 'true') {
        showSuccessMessage = true;
      }
    } else {
      hasError = true;
      errorMessage = result.error || 'Erreur lors de la récupération du fichier';
    }
  }

  if (error) {
    hasError = true;
    errorMessage = decodeURIComponent(error);
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full flex-col items-center justify-center gap-4">
        {showSuccessMessage && (
          <div className="w-full max-w-sm rounded-md border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">✅ Email vérifié avec succès !</p>
            <p className="mt-1 text-xs text-green-700">
              Vos fichiers ont été envoyés au destinataire.
            </p>
          </div>
        )}
        {error && !fileId && (
          <div className="w-full max-w-sm rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">❌ Erreur de vérification</p>
            <p className="mt-1 text-xs text-red-700">{errorMessage}</p>
          </div>
        )}
        <div className="flex w-full items-center justify-center gap-4">
          <div className="w-full max-w-sm">
            <SendFileCard />
          </div>
          {fileId && (
            <div className="w-full max-w-sm">
              <DownloadFileCard
                fileName="files.zip"
                fileUrl={downloadUrl}
                error={hasError ? errorMessage : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
