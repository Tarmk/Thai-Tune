import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, serverTimestamp, deleteDoc, collection, getDocs, query } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { ticketId, status } = await request.json()
    
    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate status values
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }
    
    const ticketRef = doc(db, 'support_tickets', ticketId)
    
    // If status is "closed", delete the ticket and its conversation
    if (status === 'closed') {
      try {
        // First, delete all messages in the conversation subcollection
        const conversationRef = collection(db, 'support_tickets', ticketId, 'messages')
        const messagesQuery = query(conversationRef)
        const messagesSnapshot = await getDocs(messagesQuery)
        
        // Delete all messages
        const deletePromises = messagesSnapshot.docs.map(messageDoc => 
          deleteDoc(messageDoc.ref)
        )
        await Promise.all(deletePromises)
        
        // Then delete the ticket document itself
        await deleteDoc(ticketRef)
        
        console.log(`Ticket ${ticketId} and its ${messagesSnapshot.docs.length} messages deleted successfully`)
        
        return NextResponse.json({
          success: true,
          message: 'Ticket deleted successfully',
          deleted: true
        })
      } catch (error) {
        console.error('Error deleting ticket:', error)
        return NextResponse.json(
          { error: 'Failed to delete ticket' },
          { status: 500 }
        )
      }
    } else {
      // For other statuses, just update the ticket
      await updateDoc(ticketRef, {
        status,
        updatedAt: serverTimestamp()
      })
      
      return NextResponse.json({
        success: true,
        message: 'Ticket status updated successfully',
        deleted: false
      })
    }
  } catch (error) {
    console.error('Error updating ticket status:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    )
  }
} 