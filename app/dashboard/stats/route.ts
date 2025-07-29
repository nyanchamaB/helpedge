// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const userRole = req.headers.get('x-user-role');
    const currentUserId = req.headers.get('x-user-id');

    // Build base query based on user role
    let baseQuery: any = {};
    if (userRole === 'end_user') {
      baseQuery.requester = currentUserId;
    } else if (userRole === 'agent') {
      baseQuery.$or = [
        { assignedTo: currentUserId },
        { assignedTo: { $exists: false } },
        { assignedTo: null }
      ];
    }

    // Get current date for "today" calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Aggregate ticket statistics
    const [
      totalTickets,
      openTickets,
      pendingTickets,
      resolvedToday,
      slaBreached,
      recentTickets
    ] = await Promise.all([
      Ticket.countDocuments(baseQuery),
      Ticket.countDocuments({ ...baseQuery, status: 'open' }),
      Ticket.countDocuments({ ...baseQuery, status: 'pending' }),
      Ticket.countDocuments({
        ...baseQuery,
        status: 'resolved',
        resolvedAt: { $gte: today, $lt: tomorrow }
      }),
      Ticket.countDocuments({ ...baseQuery, slaBreached: true }),
      Ticket.find(baseQuery)
        .populate('requester', 'name email')
        .populate('assignedTo', 'name email')
        .populate('category', 'name color')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Calculate average response time (simplified)
    const avgResponseTime = '2.3 hours'; // This should be calculated based on actual data

    // Get SLA alerts (tickets close to breaching SLA)
    const slaAlerts = await Ticket.find({
      ...baseQuery,
      status: { $in: ['open', 'in_progress'] },
      dueDate: { $lte: new Date(Date.now() + 4 * 60 * 60 * 1000) } // Next 4 hours
    })
    .populate('requester', 'name email')
    .sort({ dueDate: 1 })
    .limit(10);

    return NextResponse.json({
      stats: {
        totalTickets,
        openTickets,
        pendingTickets,
        resolvedToday,
        slaBreached,
        avgResponseTime
      },
      recentTickets,
      slaAlerts: slaAlerts.map(ticket => ({
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        priority: ticket.priority,
        timeRemaining: ticket.dueDate ? 
          Math.max(0, Math.floor((ticket.dueDate.getTime() - Date.now()) / (1000 * 60))) + ' minutes' :
          'No SLA'
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}