import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react'
import { manualsService } from '@/services/manualsService'
import { extractTextFromPdf } from '@/utils/pdfUtils'

// Componente Label Simples (se nao existir no shadcn ainda)
function SimpleLabel({ children, className }) {
    return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
}

export function ManualUploadForm({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [machineType, setMachineType] = useState('')
    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')

    const onDrop = useCallback(acceptedFiles => {
        const selected = acceptedFiles[0]
        if (selected?.type === 'application/pdf') {
            setFile(selected)
            if (!title) setTitle(selected.name.replace('.pdf', ''))
        } else {
            alert('Apenas arquivos PDF são permitidos.')
        }
    }, [title])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) return

        setLoading(true)
        try {
            // 1. Extract Text (Client-Side)
            let extractedText = ''
            try {
                extractedText = await extractTextFromPdf(file)
                console.log('Texto extraído (preview):', extractedText.substring(0, 100) + '...')
            } catch (err) {
                console.warn('Não foi possível extrair texto:', err)
                // Continue upload even if extraction fails, but warn user? For now just log.
            }

            // 2. Upload File
            const { publicUrl, fileName } = await manualsService.upload(file)

            // 3. Create Record
            await manualsService.create({
                title,
                machine_type: machineType,
                brand,
                model,
                file_url: publicUrl,
                file_name: fileName,
                content_extracted: extractedText,
                uploaded_by_email: 'admin@petra.ai' // TODO: Pegar do context
            })

            onSuccess()
            handleClose()
        } catch (error) {
            console.error(error)
            alert('Erro no upload: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFile(null)
        setTitle('')
        setMachineType('')
        setBrand('')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload de Manual Técnico</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!file ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                                ${isDragActive ? 'border-[var(--primary-orange)] bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                                Arraste e solte o PDF aqui, ou clique para selecionar.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Máximo 50MB (Plano Free)</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-blue-500" />
                                <div className="text-sm">
                                    <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <SimpleLabel>Título do Manual</SimpleLabel>
                        <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Manual de Serviço D6T" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <SimpleLabel>Tipo de Máquina</SimpleLabel>
                            <Select value={machineType} onValueChange={setMachineType} required>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Escavadeira">Escavadeira</SelectItem>
                                    <SelectItem value="Trator">Trator</SelectItem>
                                    <SelectItem value="Caminhão">Caminhão</SelectItem>
                                    <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <SimpleLabel>Marca</SimpleLabel>
                            <Input value={brand} onChange={e => setBrand(e.target.value)} required placeholder="Ex: Caterpillar" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <SimpleLabel>Modelo (Opcional)</SimpleLabel>
                        <Input value={model} onChange={e => setModel(e.target.value)} placeholder="Ex: D6T XL" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" className="bg-[var(--primary-orange)]" disabled={!file || loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Processando...' : 'Enviar Arquivo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
