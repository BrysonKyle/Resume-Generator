import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const payload = authenticateToken(request);
    if (!payload) {
      return NextResponse.json(
        { message: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    const {
      name,
      email,
      phoneNumber,
      linkedinUrl,
      workExperience,
      education,
    } = await request.json();

    // Validate required fields
    if (!name || !email || !phoneNumber) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const user = new User({
      managerId: payload.userId,
      name,
      email,
      phoneNumber,
      linkedinUrl,
      workExperience: workExperience || [],
      education: education || [],
    });

    await user.save();

    return NextResponse.json({
      message: 'User created successfully',
      user,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
