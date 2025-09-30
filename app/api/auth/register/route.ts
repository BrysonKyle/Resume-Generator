import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Manager from '@/models/Manager';
import { hashPassword } from '@/lib/auth';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if manager already exists
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return NextResponse.json(
        { message: 'Manager with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new manager
    const manager = new Manager({
      name,
      email,
      password: hashedPassword,
    });

    await manager.save();

    // Generate JWT token
    const token = generateToken({
      userId: manager._id.toString(),
      email: manager.email,
    });

    // Remove password from response
    const managerResponse = manager.toObject();
    delete managerResponse.password;

    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: managerResponse,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
