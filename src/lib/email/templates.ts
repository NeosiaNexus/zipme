import { render } from '@react-email/render';

import SendFileEmail from './components/SendFileEmail';
import VerifyEmail from './components/VerifyEmail';

import type { TemplateName, Templates } from './email-types';

const renderTemplate = <T extends TemplateName>(
  template: T,
  props: Templates[T],
): Promise<string> => {
  if (template === 'send-file') {
    const sendFileProps = props as Templates['send-file'];
    return render(
      SendFileEmail({ senderEmail: sendFileProps.senderEmail, url: sendFileProps.url }),
    );
  }

  if (template === 'verify-email') {
    const verifyEmailProps = props as Templates['verify-email'];
    return render(VerifyEmail({ verifyUrl: verifyEmailProps.verifyUrl }));
  }

  throw new Error(`Email template "${template}" not found`);
};

export default renderTemplate;
