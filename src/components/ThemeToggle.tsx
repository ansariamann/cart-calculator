import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { click } = useSoundEffects();

  const handleToggle = useCallback(() => {
    click();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme, click]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="w-9 h-9 rounded-full bg-secondary/50 hover:bg-secondary"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
