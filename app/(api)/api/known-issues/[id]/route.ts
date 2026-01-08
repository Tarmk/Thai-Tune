import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, status, priority, category, estimatedFix, workaround } = body
    const { id } = params

    if (!title || !description || !status || !priority || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const docRef = doc(db, 'knownIssues', id)
    await updateDoc(docRef, {
      title,
      description,
      status,
      priority,
      category,
      estimatedFix: estimatedFix || null,
      workaround: workaround || null,
      updatedAt: serverTimestamp()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Known issue updated successfully' 
    })
  } catch (error) {
    console.error('Error updating known issue:', error)
    return NextResponse.json({ error: 'Failed to update known issue' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const docRef = doc(db, 'knownIssues', id)
    await deleteDoc(docRef)

    return NextResponse.json({ 
      success: true, 
      message: 'Known issue deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting known issue:', error)
    return NextResponse.json({ error: 'Failed to delete known issue' }, { status: 500 })
  }
} 