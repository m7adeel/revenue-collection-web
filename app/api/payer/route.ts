import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const type = searchParams.get('type')

  // Handle category listing
  if (type === 'categories') {
    const { data, error } = await supabase
      .from('payer_categories')
      .select('*')
      .order('name')
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  // Handle single payer fetch
  if (id) {
    const { data, error } = await supabase
      .from('payer')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  // Handle payer listing
  const { data, error } = await supabase.from('payer').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { type } = body

  // Handle category creation
  if (type === 'category') {
    const { data, error } = await supabase
      .from('payer_categories')
      .insert([{ name: body.name, description: body.description }])
      .select()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data[0], { status: 201 })
  }

  // Handle payer creation
  const { data, error } = await supabase
    .from('payer')
    .insert([body])
    .select()
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data[0], { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...updateData } = body

  const { data, error } = await supabase
    .from('payer')
    .update(updateData)
    .eq('id', id)
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('payer')
    .delete()
    .eq('id', id)
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, type } = body

  if (type === 'category') {
    const { data, error } = await supabase
      .from('payer_categories')
      .update({ name: body.name, description: body.description })
      .eq('id', id)
      .select()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data[0])
  }

  // Handle soft delete
  if (type === 'status') {
    const { data, error } = await supabase
      .from('payer')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data[0])
  }

  return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
}
