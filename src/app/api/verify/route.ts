import { finalizeSendFile } from '@/app/_components/SendFileCard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Token manquant')}`, request.url),
    );
  }

  try {
    const result = await finalizeSendFile(token);

    if (result.success && result.fileId) {
      return NextResponse.redirect(new URL(`/?id=${result.fileId}&verified=true`, request.url));
    } else {
      return NextResponse.redirect(
        new URL(
          `/?error=${encodeURIComponent(result.error || 'Erreur lors de la vérification')}`,
          request.url,
        ),
      );
    }
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error instanceof Error ? error.message : 'Erreur inattendue')}`,
        request.url,
      ),
    );
  }
}
