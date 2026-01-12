import { useState, useRef, useEffect } from 'react'
import { MachineSelector } from '@/components/chat/MachineSelector'
import { chatService } from '@/services/chatService'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, ArrowLeft, MoreVertical, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { aiService } from '@/services/aiService'

export function ChatSupport() {
    // Header for when NO machine is selected (MachineSelector view)
    const Header = () => (
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Chat de Suporte Técnico</h1>
            <p className="text-gray-500">IA especializada em máquinas agrícolas</p>
        </div>
    )

    const [selectedMachine, setSelectedMachine] = useState(null)
    const [messages, setMessages] = useState([]) // [{ role: 'user'|'assistant', content: string|json }]
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleMachineSelect = (machine) => {
        setSelectedMachine(machine)
        // Welcome message
        setMessages([
            {
                role: 'assistant',
                content: `Olá! Sou o assistente técnico virtual. Vejo que você selecionou **${machine.name} (${machine.brand} ${machine.model})**. \n\nQual problema está acontecendo com essa máquina?`
            }
        ])
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!inputText.trim()) return

        // 1. Add User Message
        const userMsg = { role: 'user', content: inputText }
        setMessages(prev => [...prev, userMsg])
        setInputText('')
        setLoading(true)

        // 2. Call AI Service
        try {
            const aiResponse = await aiService.analyzeProblem(selectedMachine, inputText)

            // Add Assistant Message
            // Note: aiResponse is likely an object (JSON), ChatMessage component handles it.
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

        } catch (error) {
            console.error("Chat Error:", error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ **Erro na análise:** \n${error.message}\n\nVerifique se a integração com IA está configurada corretamente em Configurações > IA.`
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        if (confirm("Deseja sair deste chat e selecionar outra máquina?")) {
            setSelectedMachine(null)
            setMessages([])
        }
    }

    const handleClearChat = () => {
        if (confirm("Limpar histórico?")) {
            setMessages(prev => [prev[0]]) // Keep welcome
        }
    }

    if (!selectedMachine) {
        return (
            <div className="max-w-7xl mx-auto p-6 md:p-8">
                <Header />
                <MachineSelector onSelect={handleMachineSelect} />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 md:-m-8 bg-gray-50/50">
            {/* Header */}
            <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleReset} className="-ml-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-gray-800 flex items-center gap-2">
                            {selectedMachine.name}
                            <span className="text-xs font-normal text-gray-400 border px-1.5 py-0.5 rounded-full">{selectedMachine.model}</span>
                        </h1>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            IA Online
                        </p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleClearChat} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Limpar Conversa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} role={msg.role} content={msg.content} />
                ))}

                {loading && (
                    <div className="flex gap-3 self-start max-w-[80%] animate-in fade-in">
                        <div className="w-8 h-8 rounded-full bg-purple-100 border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                            {/* Bot Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot w-5 h-5"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                        </div>
                        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Legacy/Input Area */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                    <Input
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Descreva o problema (ex: Trator não liga, Luz de óleo acesa...)"
                        className="flex-1"
                        autoFocus
                        disabled={loading}
                    />
                    <Button type="submit" disabled={!inputText.trim() || loading} className="bg-purple-600 hover:bg-purple-700">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                    </Button>
                </form>
                <div className="text-center mt-2 text-[10px] text-gray-400">
                    A IA pode cometer erros. Verifique sempre os manuais oficiais antes de proceder.
                </div>
            </div>
        </div >
    )
}
