import "./globals.css";
import { Providers } from "./providers";
import { Header } from "~~/components/Header";

export const metadata = {
  title: "Civic Auth App",
  description: "Minimal authentication app with Civic Auth",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
