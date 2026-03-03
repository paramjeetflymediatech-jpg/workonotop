import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const providerId = searchParams.get('providerId')

        let whereConditions = []
        let params = []

        if (startDate) {
            whereConditions.push('completion_date >= ?')
            params.push(`${startDate} 00:00:00`)
        }
        if (endDate) {
            whereConditions.push('completion_date <= ?')
            params.push(`${endDate} 23:59:59`)
        }
        if (providerId) {
            whereConditions.push('provider_id = ?')
            params.push(providerId)
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

        const summarySql = `
      SELECT 
        SUM(total_amount) as total_revenue,
        SUM(commission_amount) as total_commission,
        SUM(provider_earnings) as total_payouts,
        COUNT(*) as total_invoices
      FROM invoices
      ${whereClause}
    `
        const [summary] = await execute(summarySql, params)

        const invoicesSql = `
      SELECT i.*, sp.name as provider_name 
      FROM invoices i
      LEFT JOIN service_providers sp ON i.provider_id = sp.id
      ${whereClause}
      ORDER BY i.completion_date DESC
    `
        const invoices = await execute(invoicesSql, params)

        const chartSql = `
      SELECT 
        DATE(completion_date) as date,
        SUM(total_amount) as revenue,
        SUM(commission_amount) as commission
      FROM invoices
      ${whereClause}
      GROUP BY DATE(completion_date)
      ORDER BY date ASC
    `
        const chartData = await execute(chartSql, params)

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalRevenue: parseFloat(summary.total_revenue || 0),
                    totalCommission: parseFloat(summary.total_commission || 0),
                    totalPayouts: parseFloat(summary.total_payouts || 0),
                    totalInvoices: parseInt(summary.total_invoices || 0)
                },
                invoices: invoices || [],
                chartData: chartData || []
            }
        })

    } catch (error) {
        console.error('Error fetching earnings data:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch earnings'
        }, { status: 500 })
    }
}
