
import Providers from "@/components/Providers";
import "./globals.css";
import { SocketProvider } from "@/context/SocketProvider";
import { ToastProvider } from "@/context/ToastProvider";



export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <SocketProvider>
        <ToastProvider>
        <Providers>
         
          {children}
                      
        </Providers>
        </ToastProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
