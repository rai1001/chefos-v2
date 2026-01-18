import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}

const ORG_ID = '11111111-1111-1111-1111-111111111111'
const HOTEL_ID = '22222222-2222-2222-2222-222222222222'
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@chefos.test'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChefOS@2026!'

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false }
})

async function ensure(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`)
  }
}

async function main() {
  await ensure(
    await supabaseAdmin.from('orgs').upsert(
      [{ id: ORG_ID, name: 'ChefOS Owners', slug: 'chefos' }],
      { onConflict: 'id' }
    ),
    'orgs'
  )

  await ensure(
    await supabaseAdmin.from('hotels').upsert(
      [{ id: HOTEL_ID, org_id: ORG_ID, name: 'Hotel Central' }],
      { onConflict: 'id' }
    ),
    'hotels'
  )

  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true
  })
  if (userError && userError.message !== 'User already registered') {
    throw new Error(`auth admin create: ${userError.message}`)
  }

  const adminId = userData?.user?.id
  if (!adminId && userError?.message === 'User already registered') {
    const { data: existing, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) throw new Error(error.message)
    const found = existing.users.find((u) => u.email === ADMIN_EMAIL)
    if (!found) throw new Error('Admin user not found after create')
    await supabaseAdmin.auth.admin.updateUserById(found.id, { email_confirm: true })
    await supabaseAdmin.from('org_members').upsert(
      [{ org_id: ORG_ID, user_id: found.id, role: 'admin', is_active: true }],
      { onConflict: 'org_id,user_id' }
    )
  } else if (adminId) {
    await ensure(
      await supabaseAdmin.from('org_members').upsert(
        [{ org_id: ORG_ID, user_id: adminId, role: 'admin', is_active: true }],
        { onConflict: 'org_id,user_id' }
      ),
      'org_members'
    )
  }

  await ensure(
    await supabaseAdmin.from('suppliers').upsert(
      [
        {
          id: '77777777-0000-0000-0000-000000000001',
          org_id: ORG_ID,
          name: 'Proveedor Norte',
          contact_email: 'norte@proveedor.test',
          contact_phone: '+34 900 111 222'
        }
      ],
      { onConflict: 'id' }
    ),
    'suppliers'
  )

  await ensure(
    await supabaseAdmin.from('supplier_items').upsert(
      [
        {
          id: '77777777-0000-0000-0000-000000000011',
          org_id: ORG_ID,
          supplier_id: '77777777-0000-0000-0000-000000000001',
          name: 'Harina 00',
          purchase_unit: 'kg',
          pack_size: 10,
          unit_price: 12.5
        }
      ],
      { onConflict: 'id' }
    ),
    'supplier_items'
  )

  console.log('Seed prod completed')
}

main().catch((error) => {
  console.error('Seed failed:', error.message)
  process.exit(1)
})
