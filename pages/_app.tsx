import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import "../styles/index.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Sonner />
        <Component {...pageProps} />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default MyApp;
