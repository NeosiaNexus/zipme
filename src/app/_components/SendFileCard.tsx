"use server";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import supabase from "@/lib/supabase";
import { createId } from "@paralleldrive/cuid2";
import JSZip from "jszip";
import SendForm from "./SendForm";

// Constantes
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
const ZIP_FILE_NAME = "files.zip";

// Utilitaires
const checkFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
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

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Valide les données du formulaire
 */
function validateFormData(
  senderEmail: string | null,
  recipientEmail: string | null,
  uploadedFiles: File[],
): { isValid: boolean; error?: string } {
  if (
    !senderEmail ||
    !recipientEmail ||
    !uploadedFiles ||
    uploadedFiles.length === 0
  ) {
    return { isValid: false, error: "Tous les champs sont requis" };
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
): Promise<{ success: boolean; error?: string }> {
  const zipFile = new File([zipBlob], ZIP_FILE_NAME, {
    type: "application/zip",
  });
  const storagePath = `${fileId}/${ZIP_FILE_NAME}`;

  const { error } = await supabase.storage
    .from("files")
    .upload(storagePath, zipFile, {
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
 * Récupère l'URL de téléchargement signée pour un fichier
 */
export async function getDownloadUrl(
  fileId: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  "use server";

  try {
    const storagePath = `${fileId}/${ZIP_FILE_NAME}`;

    // Vérifier que le fichier existe
    const { data: fileList, error: listError } = await supabase.storage
      .from("files")
      .list(fileId);

    if (listError || !fileList || fileList.length === 0) {
      return { success: false, error: "Fichier introuvable ou expiré" };
    }

    // Générer une URL signée valide pour 24h
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(storagePath, 86400); // 24h en secondes

    if (error || !data) {
      return {
        success: false,
        error: `Erreur lors de la génération de l'URL: ${error?.message || "Erreur inconnue"}`,
      };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    return {
      success: false,
      error: `Erreur inattendue: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
    };
  }
}

/**
 * Server Action principale pour gérer l'upload de fichiers
 */
export async function handleSendFile(
  formData: FormData,
): Promise<{ success: boolean; error?: string; fileId?: string }> {
  "use server";

  try {
    // Extraction des données du formulaire
    const senderEmail = formData.get("senderEmail") as string;
    const recipientEmail = formData.get("recipientEmail") as string;
    const uploadedFiles = formData.getAll("uploadedFiles") as File[];

    // Validation
    const validation = validateFormData(
      senderEmail,
      recipientEmail,
      uploadedFiles,
    );
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Création du zip
    const zipBlob = await createZipFile(uploadedFiles);

    // Génération d'un ID unique pour le dossier
    const fileId = createId();

    // Upload du zip vers Supabase
    const uploadResult = await uploadZipToStorage(fileId, zipBlob);
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }

    return { success: true, fileId };
  } catch (error) {
    return {
      success: false,
      error: `Erreur inattendue: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
    };
  }
}

const SendFileCard = () => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Envoyer des fichiers</CardTitle>
        <CardDescription>
          Envoyez des fichiers à vos amis, famille, collègues, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SendForm />
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground italic text-center w-full uppercase">
          Vos fichiers restent maximum 24h dans nos serveurs
        </p>
      </CardFooter>
    </Card>
  );
};

export default SendFileCard;
