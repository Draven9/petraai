import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

export function PdfViewerModal({ isOpen, onClose, url, title }) {
    if (!url) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <DialogTitle className="truncate pr-8">{title}</DialogTitle>
                    <div className="flex gap-2">
                        <a href={url} download target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Baixar
                            </Button>
                        </a>
                        <Button size="icon" variant="ghost" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-gray-100 p-0 overflow-hidden relative">
                    <iframe
                        src={`${url}#view=FitH`}
                        className="w-full h-full border-none"
                        title={title}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
