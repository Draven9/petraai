import { createContext, useContext, useState, useEffect } from 'react'
import { companyService } from '@/services/companyService'

const CompanyContext = createContext(null)

export function CompanyProvider({ children }) {
    const [company, setCompany] = useState(null)
    const [loading, setLoading] = useState(true)

    // Helper to refresh data
    const refreshCompany = async () => {
        try {
            const data = await companyService.getData()
            setCompany(data)
        } catch (error) {
            console.error("Failed to load company data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshCompany()
    }, [])

    return (
        <CompanyContext.Provider value={{ company, loading, refreshCompany }}>
            {children}
        </CompanyContext.Provider>
    )
}

export const useCompany = () => {
    const context = useContext(CompanyContext)
    if (!context) throw new Error("useCompany must be used within a CompanyProvider")
    return context
}
