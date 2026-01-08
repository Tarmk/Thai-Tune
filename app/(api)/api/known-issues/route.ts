import { NextRequest, NextResponse } from 'next/server'
import { doc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    const knownIssuesRef = collection(db, 'knownIssues')
    const q = query(knownIssuesRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const issues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }))

    return NextResponse.json({ issues })
  } catch (error) {
    console.error('Error fetching known issues:', error)
    return NextResponse.json({ error: 'Failed to fetch known issues' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, status, priority, category, estimatedFix, workaround } = body

    if (!title || !description || !status || !priority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const knownIssuesRef = collection(db, 'knownIssues')
    const docRef = await addDoc(knownIssuesRef, {
      title,
      description,
      status,
      priority,
      category,
      estimatedFix: estimatedFix || null,
      workaround: workaround || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'Known issue created successfully' 
    })
  } catch (error) {
    console.error('Error creating known issue:', error)
    return NextResponse.json({ error: 'Failed to create known issue' }, { status: 500 })
  }
} 