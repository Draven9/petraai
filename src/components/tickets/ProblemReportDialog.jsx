import { useState, useEffect } from 'react'
import { machinesService } from '@/services/machinesService'
import { ticketsService } from '@/services/ticketsService'
import { aiService } from '@/services/aiService'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, BrainCircuit, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AIAnalysisDisplay } from './AIAnalysisDisplay'

// Simple Label component standard
function SimpleLabel({ children, htmlFor }) {
    return <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">{children}</label>
}

export function ProblemReportDialog({ onTicketCreated }) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1) // 1=Form, 2=Analyzing, 3=Result
    const [loading, setLoading] = useState(false)
    const [machines, setMachines] = useState([])

    // Data
    const [formData, setFormData] = useState({
        machine_id: '',
        problem_description: '',
        urgency: 'media',
        location: ''
    })
    const [analysis, setAnalysis] = useState(null)
    const [createdTicketId, setCreatedTicketId] = useState(null)

    useEffect(() => {
        if (open) {
            loadMachines()
            // Reset state on open
            setStep(1)
            setAnalysis(null)
            setCreatedTicketId(null)
            setFormData(prev => ({ ...prev, machine_id: '', problem_description: '' }))
        }
    }, [open])

    const loadMachines = async () => {
        try {
            const data = await machinesService.list()
            setMachines(data || [])
        } catch (error) {
            console.error('Failed to load machines', error)
        }
    }

    const handleAnalyzeAndCreate = async () => {
        if (!formData.machine_id || !formData.problem_description) {
            alert('Preencha a máquina e o problema')
            return
        }

        setLoading(true)
        setStep(2) // Analyzing UI

        try {
            // 1. Get Machine Details
            const machine = machines.find(m => m.id === formData.machine_id)

            // 2. Call AI
            let aiResult = null
            try {
                aiResult = await aiService.analyzeProblem(machine, formData.problem_description)
            } catch (aiErr) {
                console.error("AI Failed, proceeding without it", aiErr)
                aiResult = { error: "AI Service indisponível: " + aiErr.message }
            }

            // 3. Create Ticket (saving AI result)
            const newTicket = await ticketsService.create({
                machine_id: formData.machine_id,
                problem_description: formData.problem_description,
                urgency: formData.urgency,
                location: formData.location,
                status: 'aberto',
                ai_analysis: aiResult // Save to DB
            })

            // 4. Show Success & Analysis
            setCreatedTicketId(newTicket.id)
            setAnalysis(aiResult)
            setStep(3)

            if (onTicketCreated) onTicketCreated()

        } catch (error) {
            console.error(error)
            alert('Erro crítico ao criar chamado: ' + error.message)
            setStep(1) // Back to form
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setOpen(false)
        setStep(1)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[var(--primary-orange)] shadow-md hover:shadow-lg transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Relatar Problema
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Relatório de Problema & Diagnóstico IA</DialogTitle>
                    <DialogDescription>
                        Descreva o problema para iniciar o processo de suporte inteligente.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <SimpleLabel htmlFor="machine">Equipamento</SimpleLabel>
                                <Select
                                    value={formData.machine_id}
                                    onValueChange={(val) => setFormData({ ...formData, machine_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {machines.map(m => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.name} ({m.model})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <SimpleLabel htmlFor="urgency">Prioridade</SimpleLabel>
                                <Select
                                    value={formData.urgency}
                                    onValueChange={(val) => setFormData({ ...formData, urgency: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baixa">Baixa</SelectItem>
                                        <SelectItem value="media">Média</SelectItem>
                                        <SelectItem value="alta">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <SimpleLabel htmlFor="location">Localização (Opcional)</SimpleLabel>
                            <input
                                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                                placeholder="Onde a máquina está?"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div>
                            <SimpleLabel htmlFor="description">O que está acontecendo?</SimpleLabel>
                            <Textarea
                                className="min-h-[100px]"
                                placeholder="Descreva os sintomas, barulhos ou códigos de erro..."
                                value={formData.problem_description}
                                onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                            />
                        </div>

                        <DialogFooter>
                            <Button onClick={handleAnalyzeAndCreate} disabled={!formData.machine_id || !formData.problem_description} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                                <BrainCircuit className="mr-2 h-4 w-4" />
                                Analisar com IA & Criar Chamado
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 2 && (
                    <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in fade-in">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin"></div>
                            <BrainCircuit className="h-8 w-8 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Analisando Problema...</h3>
                            <p className="text-sm text-gray-500">Consultando base de conhecimento técnica e manuais.</p>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="py-4 space-y-6 animate-in slide-in-from-bottom-5">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-green-900">Chamado #{createdTicketId?.slice(0, 8)} criado!</h3>
                                    <p className="text-sm text-green-700">A equipe técnica foi notificada.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Diagnóstico Preliminar da IA</h3>

                            {analysis?.error ? (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                                    {analysis.error}
                                </div>
                            ) : (
                                <AIAnalysisDisplay analysis={analysis} />
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>Fechar</Button>
                        </DialogFooter>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}
