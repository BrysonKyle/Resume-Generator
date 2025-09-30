import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Manager from '@/models/Manager';
import { authenticateToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

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

    const updateData = await request.json();
    const { password, email, ...otherUpdates } = updateData;

    // If email is being updated, check if it already exists for another manager
    if (email) {
      const existingManager = await Manager.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: payload.userId }
      });
      
      if (existingManager) {
        return NextResponse.json(
          { message: 'Email already exists for another account' },
          { status: 400 }
        );
      }
      otherUpdates.email = email.toLowerCase().trim();
    }

    // If password is being updated, hash it
    if (password) {
      otherUpdates.password = await hashPassword(password);
    }

    // Update manager
    const manager = await Manager.findByIdAndUpdate(
      payload.userId,
      otherUpdates,
      { new: true, runValidators: true }
    );

    if (!manager) {
      return NextResponse.json(
        { message: 'Manager not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const managerResponse = manager.toObject();
    delete managerResponse.password;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: managerResponse,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
