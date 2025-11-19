import { render } from '@react-email/render';

import SendFileEmail from './components/SendFileEmail';

import type { TemplateName, Templates } from './email-types';

const renderTemplate = <T extends TemplateName>(
  template: T,
  props: Templates[T],
): Promise<string> => {
  if (template === 'send-file') {
    return render(SendFileEmail({ senderEmail: props.senderEmail, url: props.url }));
  }

  throw new Error(`Email template "${template}" not found`);
};

export default renderTemplate;
