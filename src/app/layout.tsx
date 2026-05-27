import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Poppins, Fraunces } from 'next/font/google';
import './globals.css';
import CommandPill from '@/components/command-pill';

const helveticaNow = localFont({
  src: [
    {
      path: './fonts/Helvetica Now/HelveticaNowDisplayLight.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Helvetica Now/HelveticaNowDisplay.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Helvetica Now/HelveticaNowDisplayMedium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Helvetica Now/HelveticaNowDisplayBold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-helvetica',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fraunces',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'AgentSecrets — Zero-Knowledge Credential Infrastructure for AI Agents & Teams',
  description:
    'The standard secure credential layer for AI agents, coding assistants (Cursor, Claude), and engineering teams. Call APIs by reference without raw keys in memory. 10-second setup.',
  keywords: [
    'AI agents secrets management',
    'secrets infrastructure for AI',
    'agentic secrets infrastructure',
    'credentials infrastructure for agents',
    'AI agent credential security',
    'AI secrets manager',
    'zero-knowledge API key manager',
    'secrets manager for Cursor and Claude',
    'secure credentials for AI agents',
    'MCP server secrets storage',
    'protect Cursor from env file theft',
    'team credential sharing zero-knowledge',
    'prevent prompt injection key exposure',
    'API key proxy for LLM workflows',
    'OS keychain credential manager',
    'agentic credential proxy',
    'AI developer secrets security',
  ],
  openGraph: {
    title: 'AgentSecrets — Zero-Knowledge Credential Infrastructure for AI Agents & Teams',
    description:
      'The standard secure credential layer for AI agents, coding assistants (Cursor, Claude), and engineering teams. API keys remain hidden. 10-second setup.',
    url: 'https://agentsecrets.theseventeen.co',
    siteName: 'AgentSecrets',
    images: [
      {
        url: 'https://agentsecrets.theseventeen.co/Logo.png',
        width: 1200,
        height: 630,
        alt: 'AgentSecrets Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentSecrets — Zero-Knowledge Credentials for AI & Teams',
    description:
      'Stop pasting secrets into AI tools. Protect your environments. Zero-knowledge credential proxy with 10-second setup.',
    images: ['https://agentsecrets.theseventeen.co/Logo.png'],
  },
  alternates: {
    canonical: 'https://agentsecrets.theseventeen.co',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning className={`${helveticaNow.variable} ${poppins.variable} ${fraunces.variable}`}>
      <body className='antialiased font-sans bg-white text-[#1B1B1B]'>
        {children}
        <CommandPill />
      </body>
    </html>
  );
}
