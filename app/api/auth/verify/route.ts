import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Manager from '@/models/Manager';
import { authenticateToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const payload = authenticateToken(request);
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    // Find manager by ID
    const manager = await Manager.findById(payload.userId);
    if (!manager) {
      return NextResponse.json(
        { message: 'Manager not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const managerResponse = manager.toObject();
    delete managerResponse.password;

    return NextResponse.json(managerResponse);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
