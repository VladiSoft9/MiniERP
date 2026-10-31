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

export async function createSalesOrder({ orderData, newItemData = null }) {
  let itemId = orderData.item_id

  // 1. If user opted to register a new item, insert it into items table first
  if (newItemData) {
    const { data: createdItem, error: itemError } = await supabase
      .from('items')
      .insert({
        code: newItemData.code.trim().toUpperCase(),
        name: newItemData.name.trim(),
        type: newItemData.type,
        unit_of_measure: newItemData.unit_of_measure || 'pcs',
        standard_cost: Number(newItemData.standard_cost) || 0,
        description: newItemData.description?.trim() || null,
      })
      .select()
      .single()

    if (itemError) {
      console.error('Error creating new item:', itemError)
      throw new Error(`Failed to create product: ${itemError.message}`)
    }

    itemId = createdItem.id
  }

  if (!itemId) {
    throw new Error('A product must be selected or registered.')
  }

  const quantity = Number(orderData.quantity)
  const unitPrice = Number(orderData.unit_price)
  const totalValue = Number((quantity * unitPrice).toFixed(2))

  // 2. Insert sales order into sales_orders table
  const { data: createdOrder, error: orderError } = await supabase
    .from('sales_orders')
    .insert({
      order_number: orderData.order_number.trim(),
      customer_name: orderData.customer_name.trim(),
      item_id: itemId,
      quantity,
      unit_price: unitPrice,
      total_value: totalValue,
      status: orderData.status || 'confirmed',
      order_date: orderData.order_date || new Date().toISOString().split('T')[0],
      delivery_date: orderData.delivery_date || null,
      notes: orderData.notes?.trim() || null,
    })
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
    .single()

  if (orderError) {
    console.error('Error creating sales order:', orderError)
    throw new Error(`Failed to create sales order: ${orderError.message}`)
  }

  return createdOrder
}

export function generateNextOrderNumber(existingOrders = []) {
  const currentYear = new Date().getFullYear()
  const prefix = `SO-${currentYear}-`

  let maxNum = 0
  for (const order of existingOrders) {
    if (order.order_number && order.order_number.startsWith(prefix)) {
      const numPart = parseInt(order.order_number.slice(prefix.length), 10)
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart
      }
    }
  }

  const nextNum = String(maxNum + 1).padStart(3, '0')
  return `${prefix}${nextNum}`
}
