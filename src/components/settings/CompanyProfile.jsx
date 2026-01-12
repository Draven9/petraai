import { useState, useEffect } from 'react'
import { companyService } from '@/services/companyService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Save, Upload, Building2 } from 'lucide-react'

function Label({ children, htmlFor }) {
    return <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">{children}</label>
}

export function CompanyProfile() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [logoFile, setLogoFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    const [formData, setFormData] = useState({
        id: null,
        name: '',
        contact_email: '',
        address: ''
    })

    useEffect(() => {
        loadCompany()
    }, [])

    const loadCompany = async () => {
        try {
            const data = await companyService.getData()
            if (data) {
                setFormData({
                    id: data.id,
                    name: data.name || '',
                    contact_email: data.contact_email || '',
                    address: data.address || ''
                })
                if (data.logo_url) setPreviewUrl(data.logo_url)
            }
        } catch (error) {
            console.error('Error loading company:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setLogoFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            let logo_url = previewUrl

            // 1. Upload Logo if changed
            if (logoFile) {
                logo_url = await companyService.uploadLogo(logoFile)
            }

            // 2. Upsert Data
            await companyService.upsert({
                ...(formData.id ? { id: formData.id } : {}), // Keep ID if exists
                name: formData.name,
                contact_email: formData.contact_email,
                address: formData.address,
                logo_url,
                owner_email: 'admin@petra.ai' // Fallback
            })

            alert('Dados da empresa atualizados!')
            // Ideal: Atualizar contexto global de Theme/Company se existir
        } catch (error) {
            console.error(error)
            alert('Erro ao salvar: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-4"><Loader2 className="animate-spin" /> Carregando...</div>

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border shadow-sm">

            {/* Logo Section */}
            <div className="flex items-start gap-6 pb-6 border-b">
                <div className="w-24 h-24 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden relative">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : (
                        <Building2 className="text-gray-300 h-10 w-10" />
                    )}
                </div>
                <div className="flex-1">
                    <Label htmlFor="logo">Logotipo da Empresa</Label>
                    <div className="flex items-center gap-2 mt-2">
                        <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} className="max-w-xs" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Recomendado: PNG ou JPG, fundo transparente.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="name">Nome da Empresa</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Minha Construtora Ltda"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="contact_email">Email de Contato</Label>
                    <Input
                        id="contact_email"
                        value={formData.contact_email}
                        onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="contato@empresa.com"
                    />
                </div>
                <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                        id="address"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua Exemplo, 123 - Cidade/UF"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="bg-[var(--primary-orange)]">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!saving && <Save className="mr-2 h-4 w-4" />}
                    Salvar Dados
                </Button>
            </div>
        </form>
    )
}
