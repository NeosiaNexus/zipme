import DownloadFileCard from './_components/DownloadFileCard';
import SendFileCard, { getDownloadUrl } from './_components/SendFileCard';

interface HomeProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const fileId = params.id;

  let downloadUrl: string | undefined;
  let hasError = false;
  let errorMessage = '';

  // Si un ID est présent dans l'URL, récupérer l'URL de téléchargement
  if (fileId) {
    const result = await getDownloadUrl(fileId);
    if (result.success && result.url) {
      downloadUrl = result.url;
    } else {
      hasError = true;
      errorMessage = result.error || 'Erreur lors de la récupération du fichier';
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full items-center justify-center gap-4">
        <SendFileCard />
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
  );
}
