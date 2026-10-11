import supabase from './supabase'

export async function fetchSalesOrders() {
  const { data, error } = await supabase
    .from('sales_orders')
    .select(`
      id,
      order_number,
      customer_name,
      quantity,
      unit_price,
      total_value,
      status,
      order_date,
      delivery_date,
      notes,
      created_at,
      item:items (
        id,
        code,
        name,
        type,
        unit_of_measure,
        standard_cost
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sales orders:', error)
    throw error
  }

  return data || []
}

export async function fetchEligibleItems() {
  const { data, error } = await supabase
    .from('items')
    .select('id, code, name, type, unit_of_measure, standard_cost')
    .in('type', ['finished_good', 'semi_finished'])
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching eligible items:', error)
    throw error
  }

  return data || []
}
