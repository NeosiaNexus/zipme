"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";

interface DownloadFileCardProps {
  senderEmail: string;
  message?: string;
  fileName: string;
  fileUrl?: string;
  onDownload?: () => void;
}

const DownloadFileCard = ({ 
  senderEmail, 
  message, 
  fileName, 
  fileUrl, 
  onDownload 
}: DownloadFileCardProps) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Télécharger le fichier</CardTitle>
        <CardDescription>Fichier reçu de {senderEmail}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="sender-email" className="gap-1">
              E-mail de l'émetteur
            </Label>
            <div 
              id="sender-email" 
              className="w-full px-3 py-2 text-sm border rounded-md bg-muted"
            >
              {senderEmail}
            </div>
          </div>
          {message && (
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="message">Message</Label>
              <div 
                id="message" 
                className="w-full px-3 py-2 text-sm border rounded-md bg-muted min-h-[60px] max-h-40 overflow-y-auto whitespace-pre-wrap"
              >
                {message}
              </div>
            </div>
          )}
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="file-name">Fichier</Label>
            <div 
              id="file-name" 
              className="w-full px-3 py-2 text-sm border rounded-md bg-muted flex items-center gap-2"
            >
              <span className="truncate">{fileName}</span>
            </div>
          </div>
          <Button onClick={handleDownload} className="w-full">
            Télécharger
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground italic text-center w-full uppercase">
          Fichier disponible pendant 24h
        </p>
      </CardFooter>
    </Card>
  );
};

export default DownloadFileCard;