import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to seed auth users')
  process.exit(1)
}

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? 'admin@chefos.test'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'ChefOS@2026!'
const DEFAULT_USER_ID = '33333333-3333-3333-3333-333333333333'

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function ensureTestUser() {
  const { data: listResult, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 100
  })
  if (listError) {
    throw listError
  }

  let user = listResult?.users?.find((candidate) => candidate.email === TEST_EMAIL)

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      id: DEFAULT_USER_ID,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true
    })

    if (error) throw error
    user = data.user
  }

  await supabaseAdmin
    .from('org_members')
    .update({ user_id: user.id })
    .eq('user_id', DEFAULT_USER_ID)

  console.log(`Seeded auth user ${user.id} (${TEST_EMAIL})`)
}

ensureTestUser().catch((error) => {
  console.error('Failed to seed auth user:', error)
  process.exit(1)
})
