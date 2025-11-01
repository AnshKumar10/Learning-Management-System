import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import { env } from '@/configs/env.config';
import { ApiError } from '@/types/response';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

const loadTemplate = (templateName: string) => {
  const filePath = path.join(
    rootDir,
    'email-templates',
    `${templateName}.html`
  );
  return fs.readFileSync(filePath, 'utf-8');
};

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  resetToken: string
) => {
  const template = loadTemplate('resetToken');
  const resetLink = `https:${env.CLIENT_URL}/reset/${resetToken}`;

  const htmlContent = template
    .replace('{{name}}', name)
    .replace('{{resetLink}}', resetLink);

  try {
    const result = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your Learnify password',
      html: htmlContent
    });

    return result.data?.id;
  } catch (error: any) {
    throw new ApiError({
      message: 'Failed to send password reset email. Please try again later.',
      statusCode: 500,
      errors: [
        {
          path: 'email',
          message:
            error?.message || 'Email service encountered an unexpected error.'
        }
      ],
      stack: error?.stack
    });
  }
};
