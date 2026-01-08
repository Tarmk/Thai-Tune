import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd validate admin authentication here
    // For now, we'll just return the tickets
    
    const ticketsRef = collection(db, 'support_tickets')
    const q = query(ticketsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const tickets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({
      success: true,
      tickets,
      count: tickets.length
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
} 