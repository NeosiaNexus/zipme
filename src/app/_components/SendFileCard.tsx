'use server';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import sendEmail from '@/lib/email/send';
import supabase from '@/lib/supabase';
import { createId } from '@paralleldrive/cuid2';
import JSZip from 'jszip';
import SendForm from './SendForm';

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
const ZIP_FILE_NAME = 'files.zip';

const checkFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Crée un fichier zip contenant tous les fichiers uploadés
 */
async function createZipFile(files: File[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    const sanitizedName = sanitizeFileName(file.name);
    const arrayBuffer = await file.arrayBuffer();
    zip.file(sanitizedName, arrayBuffer);
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Valide les données du formulaire
 */
function validateFormData(
  senderEmail: string | null,
  recipientEmail: string | null,
  uploadedFiles: File[],
): { isValid: boolean; error?: string } {
  if (!senderEmail || !recipientEmail || !uploadedFiles || uploadedFiles.length === 0) {
    return { isValid: false, error: 'Tous les champs sont requis' };
  }

  for (const file of uploadedFiles) {
    if (!checkFileSize(file)) {
      return {
        isValid: false,
        error: `Le fichier ${file.name} dépasse la taille maximale de 5GB`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Upload le fichier zip vers Supabase Storage
 */
async function uploadZipToStorage(
  fileId: string,
  zipBlob: Blob,
  isPending = false,
): Promise<{ success: boolean; error?: string }> {
  const zipFile = new File([zipBlob], ZIP_FILE_NAME, {
    type: 'application/zip',
  });
  const storagePath = isPending
    ? `pending/${fileId}/${ZIP_FILE_NAME}`
    : `${fileId}/${ZIP_FILE_NAME}`;

  const { error } = await supabase.storage.from('files').upload(storagePath, zipFile, {
    upsert: true,
  });

  if (error) {
    return {
      success: false,
      error: `Erreur lors de l'upload: ${error.message}`,
    };
  }

  return { success: true };
}

/**
 * Stocke les métadonnées dans un fichier JSON temporaire
 */
async function storeMetadata(
  token: string,
  senderEmail: string,
  recipientEmail: string,
): Promise<{ success: boolean; error?: string }> {
  const metadata = {
    senderEmail,
    recipientEmail,
    createdAt: new Date().toISOString(),
  };

  const metadataFile = new File([JSON.stringify(metadata, null, 2)], 'metadata.json', {
    type: 'application/json',
  });
  const storagePath = `pending/${token}/metadata.json`;

  const { error } = await supabase.storage.from('files').upload(storagePath, metadataFile, {
    upsert: true,
  });

  if (error) {
    return {
      success: false,
      error: `Erreur lors du stockage des métadonnées: ${error.message}`,
    };
  }

  return { success: true };
}

/**
 * Récupère les métadonnées depuis le stockage temporaire
 */
async function getMetadata(token: string): Promise<{
  success: boolean;
  data?: { senderEmail: string; recipientEmail: string };
  error?: string;
}> {
  const storagePath = `pending/${token}/metadata.json`;

  const { data, error } = await supabase.storage.from('files').download(storagePath);

  if (error || !data) {
    return {
      success: false,
      error: `Erreur lors de la récupération des métadonnées: ${error?.message || 'Fichier introuvable'}`,
    };
  }

  try {
    const text = await data.text();
    const metadata = JSON.parse(text) as {
      senderEmail: string;
      recipientEmail: string;
      createdAt: string;
    };

    const createdAt = new Date(metadata.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 1) {
      return {
        success: false,
        error: 'Le lien de vérification a expiré. Veuillez recommencer.',
      };
    }

    return {
      success: true,
      data: { senderEmail: metadata.senderEmail, recipientEmail: metadata.recipientEmail },
    };
  } catch (parseError) {
    return {
      success: false,
      error: `Erreur lors de la lecture des métadonnées: ${parseError instanceof Error ? parseError.message : 'Erreur inconnue'}`,
    };
  }
}

/**
 * Déplace les fichiers du dossier pending vers le dossier final
 */
async function moveFilesFromPendingToFinal(
  token: string,
  fileId: string,
): Promise<{ success: boolean; error?: string }> {
  const pendingPath = `pending/${token}/${ZIP_FILE_NAME}`;
  const finalPath = `${fileId}/${ZIP_FILE_NAME}`;

  const { error: moveError } = await supabase.storage.from('files').move(pendingPath, finalPath);

  if (moveError) {
    return {
      success: false,
      error: `Erreur lors du déplacement du fichier: ${moveError.message}`,
    };
  }

  const { error: deleteError } = await supabase.storage
    .from('files')
    .remove([`pending/${token}/metadata.json`]);

  if (deleteError) {
    console.error('Erreur lors de la suppression des fichiers temporaires:', deleteError);
  }

  return { success: true };
}

/**
 * Récupère l'URL de téléchargement signée pour un fichier
 */
export async function getDownloadUrl(
  fileId: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  'use server';

  try {
    const storagePath = `${fileId}/${ZIP_FILE_NAME}`;

    const { data: fileList, error: listError } = await supabase.storage.from('files').list(fileId);

    if (listError || !fileList || fileList.length === 0) {
      return { success: false, error: 'Fichier introuvable ou expiré' };
    }

    const { data, error } = await supabase.storage
      .from('files')
      .createSignedUrl(storagePath, 86400); // 24h en secondes

    if (error || !data) {
      return {
        success: false,
        error: `Erreur lors de la génération de l'URL: ${error?.message || 'Erreur inconnue'}`,
      };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    return {
      success: false,
      error: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    };
  }
}

/**
 * Server Action principale pour gérer l'upload de fichiers
 * Stocke temporairement les fichiers et envoie un email de vérification
 */
export async function handleSendFile(
  formData: FormData,
): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> {
  'use server';

  try {
    const senderEmail = formData.get('senderEmail') as string;
    const recipientEmail = formData.get('recipientEmail') as string;
    const uploadedFiles = formData.getAll('uploadedFiles') as File[];

    const validation = validateFormData(senderEmail, recipientEmail, uploadedFiles);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const zipBlob = await createZipFile(uploadedFiles);

    const verificationToken = createId();

    const uploadResult = await uploadZipToStorage(verificationToken, zipBlob, true);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    const metadataResult = await storeMetadata(verificationToken, senderEmail, recipientEmail);
    if (!metadataResult.success) {
      return { success: false, error: metadataResult.error };
    }

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${verificationToken}`;
    await sendEmail({
      to: senderEmail,
      subject: 'Vérifiez votre email - ZipMe',
      template: 'verify-email',
      props: { verifyUrl },
    });

    return { success: true, requiresVerification: true };
  } catch (error) {
    return {
      success: false,
      error: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    };
  }
}

/**
 * Finalise l'envoi après vérification du token
 */
export async function finalizeSendFile(
  token: string,
): Promise<{ success: boolean; error?: string; fileId?: string }> {
  'use server';

  try {
    const metadataResult = await getMetadata(token);
    if (!metadataResult.success || !metadataResult.data) {
      return { success: false, error: metadataResult.error };
    }

    const { senderEmail, recipientEmail } = metadataResult.data;

    const fileId = createId();

    const moveResult = await moveFilesFromPendingToFinal(token, fileId);
    if (!moveResult.success) {
      return { success: false, error: moveResult.error };
    }

    await sendEmail({
      to: recipientEmail,
      subject: 'Fichiers partagés - ZipMe',
      template: 'send-file',
      props: { senderEmail, url: `${process.env.NEXT_PUBLIC_APP_URL}/?id=${fileId}` },
    });

    return { success: true, fileId };
  } catch (error) {
    return {
      success: false,
      error: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
    };
  }
}

const SendFileCard = () => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Envoyer des fichiers</CardTitle>
        <CardDescription>Envoyez des fichiers à vos amis, famille, collègues, etc.</CardDescription>
      </CardHeader>
      <CardContent>
        <SendForm />
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground w-full text-center text-xs uppercase italic">
          Vos fichiers restent maximum 24h dans nos serveurs
        </p>
      </CardFooter>
    </Card>
  );
};

export default SendFileCard;
