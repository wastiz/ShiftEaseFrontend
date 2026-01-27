import './globals.css';
import { Prompt } from 'next/font/google';
import TanstackProvider from '@/lib/TanstackProvider';
import { Toaster } from '@/components/ui/shadcn/sonner';
import AuthProvider from "@/lib/AuthContext";
import "@fontsource-variable/inter";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/inter/wght-italic.css";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

const prompt = Prompt({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-prompt',
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
      const locale = await getLocale();
      const messages = await getMessages();

      return (
          <html lang={locale} className={prompt.variable}>
              <body className="dark font-sans bg-bgPrimary text-textPrimary">
                    <NextIntlClientProvider messages={messages}>
                        <Toaster position="bottom-right" />
                        <TanstackProvider>
                            <AuthProvider>
                                {children}
                            </AuthProvider>
                        </TanstackProvider>
                    </NextIntlClientProvider>
              </body>
          </html>
      );
}
