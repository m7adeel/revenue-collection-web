import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      profile,
      default_payment_method,
      current_user_id,
    } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Step 1: Create Auth User
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const authUser = data?.user
    if (!authUser) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
    }

    // Step 2: Insert into your user table
    const { error: insertError } = await supabase.from('user').insert({
      user_auth_id: authUser.id,
      profile: profile,
      first_name: first_name || '',
      last_name: last_name || '',
      phone: phone || '',
      default_payment_method: default_payment_method || '',
      active: true,
      created_date: new Date().toISOString(),
      last_modified_date: new Date().toISOString(),
      created_by: current_user_id || null,
      last_modified_by: current_user_id || null,
    })

    // Step 3: Rollback if insertion failed
    if (insertError) {
      console.warn('Insert into user table failed, rolling back auth user...', insertError)
      await supabase.auth.admin.deleteUser(authUser.id)
      return NextResponse.json({ error: 'Failed to insert user metadata. User creation rolled back.' }, { status: 500 })
    }

    return NextResponse.json({ user: authUser }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
