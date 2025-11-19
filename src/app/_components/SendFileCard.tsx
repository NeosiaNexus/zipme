import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/lib/supabase";
import { Label } from "@radix-ui/react-label";

async function handleSendFile(formData: FormData): Promise<void> {
    "use server";

    const senderEmail = formData.get('senderEmail') as string;
    const recipientEmail = formData.get('recipientEmail') as string;
    const message = formData.get('message') as string;
    const uploadedFiles = formData.getAll('uploadedFiles') as File[];

    console.log(senderEmail, recipientEmail, message, uploadedFiles);

    if (!senderEmail || !recipientEmail || uploadedFiles.length === 0) {
        return;
    }

    await Promise.all(uploadedFiles.map(async (file) => {
        const { data, error } = await supabase.storage.from('files').upload(sanitizeFileName(file.name), file, {
            upsert: true,
        });
        console.log(data, error);
        if (error) {
            return;
        }
        return data;
    }));
}

const sanitizeFileName = (fileName: string): string => {
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

const SendFileCard = () => {
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Envoyer des fichiers</CardTitle>
                <CardDescription>Envoyez des fichiers à vos amis, famille, collègues, etc.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSendFile} className="flex flex-col gap-4">
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="senderEmail" className="gap-1">Votre e-mail<span className="text-xs text-red-500 italic ">*</span></Label>
                        <Input id="senderEmail" name="senderEmail" type="email" className="w-full" placeholder="ex: my.email@gmail.com" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="recipientEmail" className="gap-1">E-mail du destinataire<span className="text-xs text-red-500 italic ">*</span></Label>
                        <Input id="recipientEmail" name="recipientEmail" type="email" className="w-full" placeholder="ex: target.email@gmail.com" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" name="message" className="w-full max-h-40" placeholder="ex: Les photos du mariage ;)" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="uploadedFiles" className="gap-1">Fichiers<span className="text-xs text-red-500 italic ">*</span></Label>
                        <Input id="uploadedFiles" name="uploadedFiles" type="file" multiple />
                    </div>
                    <Button>Envoyer</Button>
                </form>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground italic text-center w-full uppercase">Vos fichiers restent maximum 24h dans nos serveurs</p>
            </CardFooter>
        </Card>
    );
};

export default SendFileCard;