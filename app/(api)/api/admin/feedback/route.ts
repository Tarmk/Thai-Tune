import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    // Get all feedback from Firebase
    const feedbackRef = collection(db, 'feedback')
    const q = query(feedbackRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const feedback = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({
      success: true,
      feedback
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
} 