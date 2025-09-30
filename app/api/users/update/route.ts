import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const payload = authenticateToken(request);
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user (only if it belongs to this manager)
    const user = await User.findOneAndUpdate(
      { _id: userId, managerId: payload.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}