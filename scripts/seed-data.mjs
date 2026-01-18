import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to seed data')
  process.exit(1)
}

const ORG_ID = '11111111-1111-1111-1111-111111111111'
const HOTEL_ID = '22222222-2222-2222-2222-222222222222'
const DEFAULT_USER_ID = '33333333-3333-3333-3333-333333333333'

const SPACE_IDS = ['66666666-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000002']
const SUPPLIER_ID = '77777777-0000-0000-0000-000000000001'
const ORDER_ID = '77777777-0000-0000-0000-000000000101'
const LINE_IDS = [
  '77777777-0000-0000-0000-000000000201',
  '77777777-0000-0000-0000-000000000202',
  '77777777-0000-0000-0000-000000000203'
]
const LOCATION_IDS = [
  '88888888-0000-0000-0000-000000000001',
  '88888888-0000-0000-0000-000000000002'
]
const BATCH_IDS = [
  '88888888-0000-0000-0000-000000000010',
  '88888888-0000-0000-0000-000000000011',
  '88888888-0000-0000-0000-000000000012',
  '88888888-0000-0000-0000-000000000013'
]
const RULE_ID = '88888888-0000-0000-0000-000000000020'
const STOCK_LEVEL_IDS = [
  '99999999-0000-0000-0000-000000000001',
  '99999999-0000-0000-0000-000000000002',
  '99999999-0000-0000-0000-000000000003'
]

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function ensure(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`)
  }
}

async function seed() {
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

  await ensure(
    await supabaseAdmin.from('org_members').upsert(
      [{ org_id: ORG_ID, user_id: DEFAULT_USER_ID, role: 'admin', is_active: true }],
      { onConflict: 'org_id,user_id' }
    ),
    'org_members'
  )

  await ensure(
    await supabaseAdmin.from('spaces').upsert(
      [
        { id: SPACE_IDS[0], org_id: ORG_ID, hotel_id: HOTEL_ID, name: 'Salon Azul' },
        { id: SPACE_IDS[1], org_id: ORG_ID, hotel_id: HOTEL_ID, name: 'Terraza Norte' }
      ],
      { onConflict: 'id' }
    ),
    'spaces'
  )

  await ensure(
    await supabaseAdmin.from('suppliers').upsert(
      [
        {
          id: SUPPLIER_ID,
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
          supplier_id: SUPPLIER_ID,
          name: 'Harina 00',
          purchase_unit: 'kg',
          pack_size: 10,
          unit_price: 12.5
        },
        {
          id: '77777777-0000-0000-0000-000000000012',
          org_id: ORG_ID,
          supplier_id: SUPPLIER_ID,
          name: 'Leche entera',
          purchase_unit: 'l',
          pack_size: 6,
          unit_price: 8.4
        },
        {
          id: '77777777-0000-0000-0000-000000000013',
          org_id: ORG_ID,
          supplier_id: SUPPLIER_ID,
          name: 'Huevos camperos',
          purchase_unit: 'docena',
          pack_size: 1,
          unit_price: 3.2
        }
      ],
      { onConflict: 'id' }
    ),
    'supplier_items'
  )

  await ensure(
    await supabaseAdmin.from('purchase_orders').upsert(
      [
        {
          id: ORDER_ID,
          org_id: ORG_ID,
          hotel_id: HOTEL_ID,
          supplier_id: SUPPLIER_ID,
          status: 'draft',
          total_estimated: 96.5
        }
      ],
      { onConflict: 'id', ignoreDuplicates: true }
    ),
    'purchase_orders'
  )

  await ensure(
    await supabaseAdmin.from('purchase_order_lines').upsert(
      [
        {
          id: LINE_IDS[0],
          org_id: ORG_ID,
          purchase_order_id: ORDER_ID,
          supplier_item_id: '77777777-0000-0000-0000-000000000011',
          requested_qty: 2,
          unit_price: 12.5,
          rounding_rule: 'ceil_pack',
          pack_size: 10
        },
        {
          id: LINE_IDS[1],
          org_id: ORG_ID,
          purchase_order_id: ORDER_ID,
          supplier_item_id: '77777777-0000-0000-0000-000000000012',
          requested_qty: 3,
          unit_price: 8.4,
          rounding_rule: 'none',
          pack_size: null
        },
        {
          id: LINE_IDS[2],
          org_id: ORG_ID,
          purchase_order_id: ORDER_ID,
          supplier_item_id: '77777777-0000-0000-0000-000000000013',
          requested_qty: 1,
          unit_price: 3.2,
          rounding_rule: 'none',
          pack_size: null
        }
      ],
      { onConflict: 'id' }
    ),
    'purchase_order_lines'
  )

  await ensure(
    await supabaseAdmin.from('inventory_locations').upsert(
      [
        { id: LOCATION_IDS[0], org_id: ORG_ID, hotel_id: HOTEL_ID, name: 'Almacen Central', is_default: true },
        { id: LOCATION_IDS[1], org_id: ORG_ID, hotel_id: HOTEL_ID, name: 'Camara Fria', is_default: false }
      ],
      { onConflict: 'id' }
    ),
    'inventory_locations'
  )

  await ensure(
    await supabaseAdmin.from('stock_batches').upsert(
      [
        {
          id: BATCH_IDS[0],
          org_id: ORG_ID,
          location_id: LOCATION_IDS[0],
          supplier_item_id: '77777777-0000-0000-0000-000000000011',
          qty_on_hand: 20,
          expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'purchase'
        },
        {
          id: BATCH_IDS[1],
          org_id: ORG_ID,
          location_id: LOCATION_IDS[0],
          supplier_item_id: '77777777-0000-0000-0000-000000000012',
          qty_on_hand: 10,
          expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'purchase'
        },
        {
          id: BATCH_IDS[2],
          org_id: ORG_ID,
          location_id: LOCATION_IDS[1],
          supplier_item_id: '77777777-0000-0000-0000-000000000013',
          qty_on_hand: 6,
          expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'purchase'
        },
        {
          id: BATCH_IDS[3],
          org_id: ORG_ID,
          location_id: LOCATION_IDS[1],
          supplier_item_id: '77777777-0000-0000-0000-000000000013',
          qty_on_hand: 4,
          expires_at: null,
          source: 'prep'
        }
      ],
      { onConflict: 'id' }
    ),
    'stock_batches'
  )

  await ensure(
    await supabaseAdmin.from('expiry_rules').upsert(
      [{ id: RULE_ID, org_id: ORG_ID, threshold_days: 7, severity: 'warning', is_active: true }],
      { onConflict: 'id' }
    ),
    'expiry_rules'
  )

  await ensure(
    await supabaseAdmin.from('stock_levels').upsert(
      [
        {
          id: STOCK_LEVEL_IDS[0],
          org_id: ORG_ID,
          location_id: LOCATION_IDS[0],
          supplier_item_id: '77777777-0000-0000-0000-000000000011',
          on_hand: 20,
          available_on_hand: 20,
          consider_reservations: true
        },
        {
          id: STOCK_LEVEL_IDS[1],
          org_id: ORG_ID,
          location_id: LOCATION_IDS[0],
          supplier_item_id: '77777777-0000-0000-0000-000000000012',
          on_hand: 12,
          available_on_hand: 12,
          consider_reservations: true
        },
        {
          id: STOCK_LEVEL_IDS[2],
          org_id: ORG_ID,
          location_id: LOCATION_IDS[1],
          supplier_item_id: '77777777-0000-0000-0000-000000000013',
          on_hand: 6,
          available_on_hand: 6,
          consider_reservations: false
        }
      ],
      { onConflict: 'id' }
    ),
    'stock_levels'
  )

  console.log('Seeded base data for E2E')
}

seed().catch((error) => {
  console.error('Failed to seed base data:', error)
  process.exit(1)
})
