'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';
import { handleSendFile } from './SendFileCard';

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

const SendForm = () => {
  const [fileError, setFileError] = useState<string>('');
  const [, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileError('');
    setSubmitError('');
    setSubmitSuccess(false);

    if (!files || files.length === 0) {
      setSelectedFiles(null);
      return;
    }

    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
      totalSize += files[i].size;
    }

    if (totalSize > MAX_FILE_SIZE) {
      setFileError(
        `La taille totale des fichiers dépasse 5GB (${(totalSize / (1024 * 1024 * 1024)).toFixed(2)}GB)`,
      );
      e.target.value = ''; // Réinitialiser l'input
      setSelectedFiles(null);
      return;
    }

    setSelectedFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (fileError) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await handleSendFile(formData);

    if (result.success && result.requiresVerification) {
      setSubmitSuccess(true);
      e?.currentTarget?.reset();
      setSelectedFiles(null);
      setIsSubmitting(false);
    } else {
      setSubmitError(result.error || 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="senderEmail" className="gap-1">
          Votre e-mail<span className="text-xs text-red-500 italic">*</span>
        </Label>
        <Input
          id="senderEmail"
          name="senderEmail"
          type="email"
          className="w-full"
          placeholder="ex: my.email@gmail.com"
          required
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="recipientEmail" className="gap-1">
          E-mail du destinataire
          <span className="text-xs text-red-500 italic">*</span>
        </Label>
        <Input
          id="recipientEmail"
          name="recipientEmail"
          type="email"
          className="w-full"
          placeholder="ex: target.email@gmail.com"
          required
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="uploadedFiles" className="gap-1">
          Fichiers<span className="text-xs text-red-500 italic">*</span>{' '}
          <span className="text-muted-foreground text-xs italic">(Taille maximale : 5GB)</span>
        </Label>
        <Input
          id="uploadedFiles"
          name="uploadedFiles"
          type="file"
          multiple
          onChange={handleFileChange}
          required
        />
        {fileError && <p className="text-xs text-red-500 italic">{fileError}</p>}
      </div>
      {submitError && <p className="text-xs text-red-500 italic">{submitError}</p>}
      {submitSuccess && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-medium text-green-800">Email de vérification envoyé !</p>
          <p className="mt-1 text-xs text-green-700">
            Veuillez vérifier votre boîte de réception (y compris les spams) et cliquer sur le lien
            de vérification pour finaliser l&apos;envoi de vos fichiers.
          </p>
        </div>
      )}
      <Button type="submit" disabled={!!fileError || isSubmitting}>
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
      </Button>
    </form>
  );
};

export default SendForm;
