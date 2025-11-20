import './globals.css';
import { Prompt } from 'next/font/google';
import TanstackProvider from '@/lib/TanstackProvider';
import { Toaster } from '@/components/ui/shadcn/sonner';
import AuthProvider from "@/lib/AuthContext";
import "@fontsource-variable/inter";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/inter/wght-italic.css";

const prompt = Prompt({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-prompt',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
      return (
          <html lang="en" className={prompt.variable}>
              <body className="dark font-sans bg-bgPrimary text-textPrimary">
                    <Toaster position="bottom-right" />
                    <TanstackProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </TanstackProvider>
              </body>
          </html>
      );
}
