import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface HeaderProps {
  onOpenHistory?: () => void;
}

export const Header = ({ onOpenHistory }: HeaderProps) => {
  const { click } = useSoundEffects();

  const handleOpenHistory = () => {
    if (onOpenHistory) {
      click();
      onOpenHistory();
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/30">
      <div className="flex items-center justify-between px-4 py-4">
        {onOpenHistory ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenHistory}
            className="rounded-full hover:bg-primary/10 transition-colors"
            title="History"
          >
            <History className="w-5 h-5 text-primary" />
          </Button>
        ) : (
          <div className="w-9" />
        )}
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-extrabold tracking-[0.12em] uppercase">
            <span className="text-foreground">D</span>
            <span className="premium-gradient-text">A</span>
            <span className="text-foreground">ILY</span>
          </h1>
          <p className="text-[10px] font-medium text-muted-foreground tracking-[0.2em] uppercase">
            Simple. Easy. Yours.
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
