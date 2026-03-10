// app/api/categories/route.js - FIXED
import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'  // ✅ CHANGE: query → execute

// GET all service categories
export async function GET() {
  try {
    // ✅ execute() use karo - simple query
    const categories = await execute(
      'SELECT * FROM service_categories WHERE is_active = TRUE ORDER BY display_order, name'
    )
    
    return NextResponse.json({ 
      success: true, 
      data: categories 
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST create new category
export async function POST(request) {
  try {
    const { name, slug, icon, description, display_order } = await request.json()

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // ✅ execute() use karo
    const result = await execute(
      'INSERT INTO service_categories (name, slug, icon, description, display_order) VALUES (?, ?, ?, ?, ?)',
      [name, slug, icon || null, description || null, display_order || 0]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Category created',
      id: result.insertId 
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create category' },
      { status: 500 }
    )
  }
}

// PUT update category
export async function PUT(request) {
  try {
    const { id, name, slug, icon, description, is_active, display_order } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }

    // ✅ execute() use karo
    await execute(
      'UPDATE service_categories SET name = ?, slug = ?, icon = ?, description = ?, is_active = ?, display_order = ? WHERE id = ?',
      [name, slug, icon, description, is_active, display_order, id]
    )

    return NextResponse.json({ success: true, message: 'Category updated' })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }

    // ✅ execute() use karo
    await execute('DELETE FROM service_categories WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete category' },
      { status: 500 }
    )
  }
}