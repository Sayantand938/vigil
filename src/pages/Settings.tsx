import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function Settings() {
    const { theme, setTheme } = useTheme()

    const options = [
        { value: "light", icon: Sun, label: "Light" },
        { value: "dark", icon: Moon, label: "Dark" },
        { value: "system", icon: Monitor, label: "System" },
    ] as const

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Choose your preferred theme.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-1 rounded-lg border p-1 w-fit">
                        {options.map(({ value, icon: Icon, label }) => (
                            <Button
                                key={value}
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme(value)}
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
                </CardContent>
            </Card>
        </div>
    )
}