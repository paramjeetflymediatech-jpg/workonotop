// // app/api/services/route.js - COMPLETE FIXED VERSION
// import { NextResponse } from 'next/server'
// import { query } from '@/lib/db'

// // GET all services
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const categoryId = searchParams.get('category_id')
//     const slug = searchParams.get('slug')
//     const homepage = searchParams.get('homepage')
//     const limit = searchParams.get('limit')

//     let sql = `
//       SELECT 
//         s.*,
//         sc.name as category_name,
//         sc.slug as category_slug,
//         sc.icon as category_icon
//       FROM services s
//       LEFT JOIN service_categories sc ON s.category_id = sc.id
//       WHERE s.is_active = 1
//     `
//     const params = []

//     // Category filter
//     if (categoryId) {
//       sql += ' AND s.category_id = ?'
//       params.push(categoryId)
//     }
    
//     // Slug filter - IMPORTANT for details page
//     if (slug) {
//       sql += ' AND s.slug = ?'
//       params.push(slug)
//     }
    
//     // Homepage filter - IMPORTANT for homepage
//     if (homepage === 'true') {
//       sql += ' AND s.is_homepage = 1'
//     }

//     // Order by
//     sql += ' ORDER BY sc.display_order, s.name'
    
//     // Limit
//     if (limit) {
//       sql += ' LIMIT ?'
//       params.push(parseInt(limit))
//     }

//     const services = await query(sql, params)
    
//     // Agar slug diya hai to single object return karo
//     if (slug && services.length === 1) {
//       return NextResponse.json({ 
//         success: true, 
//         data: services[0] 
//       })
//     }

//     return NextResponse.json({ 
//       success: true, 
//       data: services 
//     })
//   } catch (error) {
//     console.error('Error fetching services:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch services' },
//       { status: 500 }
//     )
//   }
// }

// // POST create new service - for admin
// export async function POST(request) {
//   try {
//     const { 
//       category_id,
//       name,
//       slug,
//       description,
//       short_description,
//       base_price,
//       additional_price,
//       duration_minutes,
//       image_url,
//       use_cases,
//       is_homepage,
//       is_trending,
//       is_popular
//     } = await request.json()

//     if (!category_id || !name || !slug || !base_price) {
//       return NextResponse.json(
//         { success: false, message: 'Category, name, slug, and base price are required' },
//         { status: 400 }
//       )
//     }

//     const result = await query(
//       `INSERT INTO services 
//        (category_id, name, slug, description, short_description, base_price, 
//         additional_price, duration_minutes, image_url, use_cases,
//         is_homepage, is_trending, is_popular) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         category_id,
//         name,
//         slug,
//         description || null,
//         short_description || null,
//         base_price,
//         additional_price || null,
//         duration_minutes || null,
//         image_url || null,
//         use_cases || null,
//         is_homepage ? 1 : 0,
//         is_trending ? 1 : 0,
//         is_popular ? 1 : 0
//       ]
//     )

//     return NextResponse.json({ 
//       success: true, 
//       message: 'Service created',
//       id: result.insertId 
//     })
//   } catch (error) {
//     console.error('Error creating service:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to create service' },
//       { status: 500 }
//     )
//   }
// }

// // PUT update service - for admin
// export async function PUT(request) {
//   try {
//     const { 
//       id,
//       category_id,
//       name,
//       slug,
//       description,
//       short_description,
//       base_price,
//       additional_price,
//       duration_minutes,
//       image_url,
//       use_cases,
//       is_homepage,
//       is_trending,
//       is_popular,
//       is_active
//     } = await request.json()

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'ID is required' },
//         { status: 400 }
//       )
//     }

//     await query(
//       `UPDATE services 
//        SET category_id = ?, name = ?, slug = ?, description = ?, short_description = ?, 
//            base_price = ?, additional_price = ?, duration_minutes = ?, image_url = ?, 
//            use_cases = ?, is_homepage = ?, is_trending = ?, is_popular = ?, is_active = ?
//        WHERE id = ?`,
//       [
//         category_id,
//         name,
//         slug,
//         description,
//         short_description,
//         base_price,
//         additional_price,
//         duration_minutes,
//         image_url,
//         use_cases,
//         is_homepage ? 1 : 0,
//         is_trending ? 1 : 0,
//         is_popular ? 1 : 0,
//         is_active ? 1 : 0,
//         id
//       ]
//     )

//     return NextResponse.json({ success: true, message: 'Service updated' })
//   } catch (error) {
//     console.error('Error updating service:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to update service' },
//       { status: 500 }
//     )
//   }
// }

// // DELETE service - for admin
// export async function DELETE(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get('id')

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: 'ID is required' },
//         { status: 400 }
//       )
//     }

//     await query('DELETE FROM services WHERE id = ?', [id])
//     return NextResponse.json({ success: true, message: 'Service deleted' })
//   } catch (error) {
//     console.error('Error deleting service:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to delete service' },
//       { status: 500 }
//     )
//   }
// }








// app/api/services/route.js - COMPLETE FIXED VERSION WITH ID SUPPORT
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET all services
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')              // 👈 ADDED
    const categoryId = searchParams.get('category_id')
    const slug = searchParams.get('slug')
    const homepage = searchParams.get('homepage')
    const limit = searchParams.get('limit')

    let sql = `
      SELECT 
        s.*,
        sc.name as category_name,
        sc.slug as category_slug,
        sc.icon as category_icon
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = 1
    `
    const params = []

    // 👇 ADDED - ID FILTER
    if (id) {
      sql += ' AND s.id = ?'
      params.push(id)
    }

    // Category filter
    if (categoryId) {
      sql += ' AND s.category_id = ?'
      params.push(categoryId)
    }
    
    // Slug filter
    if (slug) {
      sql += ' AND s.slug = ?'
      params.push(slug)
    }
    
    // Homepage filter
    if (homepage === 'true') {
      sql += ' AND s.is_homepage = 1'
    }

    // Order by
    sql += ' ORDER BY sc.display_order, s.name'
    
    // Limit
    if (limit) {
      sql += ' LIMIT ?'
      params.push(parseInt(limit))
    }

    const services = await query(sql, params)
    
    // Agar id ya slug diya hai to single object return karo
    if ((id || slug) && services.length === 1) {
      return NextResponse.json({ 
        success: true, 
        data: services[0] 
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: services 
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST create new service
export async function POST(request) {
  try {
    const { 
      category_id,
      name,
      slug,
      description,
      short_description,
      base_price,
      additional_price,
      duration_minutes,
      image_url,
      use_cases,
      is_homepage,
      is_trending,
      is_popular
    } = await request.json()

    if (!category_id || !name || !slug || !base_price) {
      return NextResponse.json(
        { success: false, message: 'Category, name, slug, and base price are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO services 
       (category_id, name, slug, description, short_description, base_price, 
        additional_price, duration_minutes, image_url, use_cases,
        is_homepage, is_trending, is_popular) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        slug,
        description || null,
        short_description || null,
        base_price,
        additional_price || null,
        duration_minutes || null,
        image_url || null,
        use_cases || null,
        is_homepage ? 1 : 0,
        is_trending ? 1 : 0,
        is_popular ? 1 : 0
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Service created',
      id: result.insertId 
    })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create service' },
      { status: 500 }
    )
  }
}

// PUT update service
export async function PUT(request) {
  try {
    const { 
      id,
      category_id,
      name,
      slug,
      description,
      short_description,
      base_price,
      additional_price,
      duration_minutes,
      image_url,
      use_cases,
      is_homepage,
      is_trending,
      is_popular,
      is_active
    } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE services 
       SET category_id = ?, name = ?, slug = ?, description = ?, short_description = ?, 
           base_price = ?, additional_price = ?, duration_minutes = ?, image_url = ?, 
           use_cases = ?, is_homepage = ?, is_trending = ?, is_popular = ?, is_active = ?
       WHERE id = ?`,
      [
        category_id,
        name,
        slug,
        description,
        short_description,
        base_price,
        additional_price,
        duration_minutes,
        image_url,
        use_cases,
        is_homepage ? 1 : 0,
        is_trending ? 1 : 0,
        is_popular ? 1 : 0,
        is_active ? 1 : 0,
        id
      ]
    )

    return NextResponse.json({ success: true, message: 'Service updated' })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE service
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

    await query('DELETE FROM services WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Service deleted' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete service' },
      { status: 500 }
    )
  }
}