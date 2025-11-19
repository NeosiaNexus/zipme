export interface Templates {
  'send-file': { senderEmail: string; url: string };
  'verify-email': { verifyUrl: string };
}

export type TemplateName = keyof Templates;
