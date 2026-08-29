import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "./ThemeToggle"

export function Settings() {
    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Choose your preferred theme.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeToggle />
                </CardContent>
            </Card>
        </div>
    )
}