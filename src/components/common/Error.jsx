import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({ message = "Algo deu errado", onRetry }) {
    return (
        <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">Ops! Algo deu errado</h3>
            <p className="text-sm text-gray-500 max-w-sm">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="mt-2">
                    Tentar Novamente
                </Button>
            )}
        </div>
    )
}
