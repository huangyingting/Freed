import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Freed — The AI Medical Scribe Assistant for Clinicians',
  description:
    'Freed listens to patient visits, generates specialty-tuned SOAP notes, provides peer-reviewed Clinical Evidence at the point of care, suggests ICD-10/CPT codes, and pushes to any EHR in one click.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF9] text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
