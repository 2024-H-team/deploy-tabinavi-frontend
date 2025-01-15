import { Inter } from 'next/font/google';
import 'normalize.css';
import '@styles/GlobalStyles.scss';
import { MapProvider } from '@/components/MapProvider';

const inter = Inter({
    subsets: ['latin'],
    weight: ['100', '300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <MapProvider>{children}</MapProvider>
            </body>
        </html>
    );
}
