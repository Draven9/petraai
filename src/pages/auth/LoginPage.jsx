import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    const { signIn, signUp } = useAuth()
    const navigate = useNavigate()

    const handleAuth = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isSignUp) {
                const { data, error } = await signUp({ email, password })
                if (error) throw error
                // Check if session was created immediately (depends on Supabase settings/confirm email)
                if (data.session) {
                    navigate('/')
                } else {
                    alert('Cadastro realizado! Verifique seu e-mail ou faça login.')
                    setIsSignUp(false)
                }
            } else {
                const { error } = await signIn({ email, password })
                if (error) throw error
                navigate('/')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-light)] p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-[var(--primary-orange)]">PetraAI</CardTitle>
                    <CardDescription className="text-center">
                        {isSignUp
                            ? "Crie sua conta para começar."
                            : "Insira seu e-mail e senha para acessar."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <p>{error}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">E-mail</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">Senha</label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full bg-[var(--primary-orange)] hover:bg-[var(--primary-orange)]/90" type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? "Criar Conta" : "Entrar"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-2">
                    <div className="text-sm text-muted-foreground text-center">
                        {isSignUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}
                        {" "}
                        <span
                            className="text-[var(--primary-orange)] cursor-pointer hover:underline font-semibold"
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setError('')
                            }}
                        >
                            {isSignUp ? "Fazer Login" : "Registre-se"}
                        </span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
