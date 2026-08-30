// src/components/LogViewer.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Bug, Copy, Download, Trash2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LogViewer() {
    const [logs, setLogs] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLogs(logger.getLogsString());
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(logs).then(() => {
            toast.success('Logs copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy logs');
        });
    };

    const handleDownload = () => {
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vigil-logs-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        logger.clear();
        setLogs(logger.getLogsString());
        toast.info('Logs cleared');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
                className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
                )}
                title="Open Logs (Ctrl+Shift+L)"
                aria-label="Open application logs"
            >
                <Bug className="size-4" />
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Application Logs</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2 mb-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="mr-1 size-3" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="mr-1 size-3" /> Download
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleClear}>
                        <Trash2 className="mr-1 size-3" /> Clear
                    </Button>
                </div>
                <div className="flex-1 overflow-auto border rounded p-2 font-mono text-xs bg-muted/20 whitespace-pre-wrap break-all">
                    {logs || 'No logs captured.'}
                </div>
            </DialogContent>
        </Dialog>
    );
}