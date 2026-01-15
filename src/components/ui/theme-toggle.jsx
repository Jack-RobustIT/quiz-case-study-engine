import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    } else if (theme === 'dark') {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    } else {
      // System theme - show monitor icon
      return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  const getThemeLabel = () => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <div className="theme-toggle-wrapper">
      <Tooltip content={getThemeLabel()} side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {getIcon()}
        </Button>
      </Tooltip>
    </div>
  );
}

