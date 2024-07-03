import "./globals.css"; // Importe seu arquivo CSS global aqui
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: "Assistente Virtual",
  description: "Seu próximo Assistente Virtual",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <link
          href="https://rsms.me/inter/inter.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
