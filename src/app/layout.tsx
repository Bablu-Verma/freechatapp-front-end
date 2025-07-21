import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Chatme Web App | Free real-time chat app",
  description: "Chatme is a free and lightweight real-time group chat application built with Next.js and Socket.IO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
       
      >
        {children}
      </body>
    </html>
  );
}
