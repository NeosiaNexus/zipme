import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  pixelBasedPreset,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface VerifyEmailProps {
  verifyUrl: string;
}

const VerifyEmail = ({ verifyUrl }: VerifyEmailProps) => {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Vérifiez votre adresse email pour finaliser l&apos;envoi de vos fichiers</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                primary: '#1a1a1a',
                secondary: '#4a4a4a',
                muted: '#6b6b6b',
                light: '#f5f5f5',
                border: '#e5e5e5',
              },
            },
          },
        }}
      >
        <Body className="bg-[#f5f5f5] font-sans">
          <Container className="mx-auto my-[30px] max-w-[600px] overflow-hidden rounded-[5px] bg-white">
            {/* Header */}
            <Section className="px-10 pt-10 pb-6">
              <Row>
                <Column>
                  <Text className="m-0 text-center text-[28px] font-bold tracking-tight text-[#1a1a1a]">
                    📦 ZipMe - Vérification
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className="my-0 border-[#e5e5e5]" />

            {/* Main Content */}
            <Section className="px-10 pt-6">
              <Text className="m-0 text-sm leading-[22px] text-[#4a4a4a]">Bonjour,</Text>
            </Section>

            <Section className="px-10">
              <Text className="m-0 text-sm leading-[22px] text-[#4a4a4a]">
                Vous avez demandé à envoyer des fichiers via ZipMe. Pour finaliser l&apos;envoi,
                veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
              </Text>
            </Section>

            <Section className="px-10 pt-6">
              <Text className="m-0 text-center text-sm leading-[22px] text-[#4a4a4a]">
                Ce lien de vérification sera valide pendant{' '}
                <strong className="text-[#1a1a1a]">1 heure</strong>.
              </Text>
            </Section>

            {/* CTA Button Section */}
            <Section className="px-10 py-6">
              <Row>
                <Column align="center">
                  <Button
                    href={verifyUrl}
                    className="rounded-md bg-[#1a1a1a] px-8 py-3.5 text-center text-base font-semibold tracking-wide text-white no-underline"
                  >
                    Vérifier mon email
                  </Button>
                </Column>
              </Row>
            </Section>

            <Section className="px-10">
              <Text className="m-0 text-center text-sm leading-[22px] text-[#6b6b6b]">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </Text>
            </Section>

            <Section className="px-10 pt-3 pb-6">
              <Row>
                <Column className="rounded bg-[#f5f5f5] p-3">
                  <Text className="m-0 text-center font-mono text-[13px] break-all text-[#1a1a1a]">
                    {verifyUrl}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className="my-0 border-[#e5e5e5]" />

            {/* Footer */}
            <Section className="bg-[#f9f9f9] px-10 py-6">
              <Row>
                <Column>
                  <Text className="m-0 text-center text-sm leading-[22px] text-[#6b6b6b]">
                    <strong className="text-[#1a1a1a]">ZipMe</strong> - Partage de fichiers sécurisé
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="bg-[#f9f9f9] px-10 pb-6">
              <Row>
                <Column>
                  <Text className="m-0 text-center text-xs leading-[22px] text-[#9b9b9b]">
                    Si vous n&apos;avez pas demandé à envoyer des fichiers, vous pouvez ignorer cet
                    email.
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VerifyEmail.PreviewProps = {
  verifyUrl: 'https://example.com/api/verify?token=abc123',
} as VerifyEmailProps;

export default VerifyEmail;
