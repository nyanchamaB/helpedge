// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    
    const categories = await Category.find(query)
      .populate('assignedTo', 'name email')
      .sort({ name: 1 });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const userRole = req.headers.get('x-user-role');
    
    // Only admins can create categories
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, color, assignedTo, parent } = body;

    const category = await Category.create({
      name,
      description,
      color: color || '#3B82F6',
      assignedTo,
      parent
    });

    const populatedCategory = await Category.findById(category._id)
      .populate('assignedTo', 'name email')
      .populate('parent', 'name');

    return NextResponse.json({
      message: 'Category created successfully',
      category: populatedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}