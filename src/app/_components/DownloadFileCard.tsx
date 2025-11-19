'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';

interface DownloadFileCardProps {
  fileName: string;
  fileUrl?: string;
  error?: string;
  onDownload?: () => void;
}

const DownloadFileCard = ({ fileName, fileUrl, error, onDownload }: DownloadFileCardProps) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Télécharger le fichier</CardTitle>
        <CardDescription>
          Les fichiers sont disponibles pendant 24h à compter de leur envoi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="file-name">Fichier</Label>
            <div
              id="file-name"
              className="bg-muted flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span className="truncate">{fileName}</span>
            </div>
          </div>
          {error && <p className="text-xs text-red-500 italic">{error}</p>}
          <Button onClick={handleDownload} className="w-full" disabled={!fileUrl || !!error}>
            {error ? 'Fichier indisponible' : 'Télécharger'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadFileCard;
