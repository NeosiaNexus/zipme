export interface Templates {
  'send-file': { senderEmail: string; url: string };
}

export type TemplateName = keyof Templates;
