import { Loader2 } from "lucide-react"

export default function Loading({ fullScreen = false }) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
}
