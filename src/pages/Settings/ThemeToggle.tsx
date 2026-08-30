// src/pages/Settings/ThemeToggle.tsx
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: "light", icon: Sun, label: "Light", ariaLabel: "Switch to light theme" },
        { value: "dark", icon: Moon, label: "Dark", ariaLabel: "Switch to dark theme" },
        { value: "system", icon: Monitor, label: "System", ariaLabel: "Switch to system theme" },
    ] as const;

    return (
        <div className="flex gap-1 rounded-lg border p-1 w-fit">
            {options.map(({ value, icon: Icon, label, ariaLabel }) => (
                <Button
                    key={value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(value)}
                    aria-label={ariaLabel}
                    className={cn(
                        "relative gap-2 px-3 text-muted-foreground hover:text-foreground",
                        theme === value && "bg-muted text-foreground"
                    )}
                >
                    <Icon className="size-4" />
                    <span className="sr-only">{label}</span>
                    {theme === value && (
                        <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </Button>
            ))}
        </div>
    );
}