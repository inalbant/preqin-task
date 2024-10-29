import { Investor, InvestorDetails } from "./types"

export async function fetchInvestors(): Promise<Investor[]> {
    const response = await fetch('http://127.0.0.1:8000/investors/')
    if (!response.ok) throw new Error('Failed to fetch data')
    return response.json()
}

export async function fetchInvestor(name: string): Promise<InvestorDetails> {
    const response = await fetch(`http://127.0.0.1:8000/investors/${name}`)
    if (!response.ok) throw new Error('Failed to fetch data')
    return response.json()
}
