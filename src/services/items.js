import supabase from './supabase'

export async function fetchItems() {
  const { data, error } = await supabase
    .from('items')
    .select('id, code, name, type, unit_of_measure, standard_cost, description, created_at')
    .order('code', { ascending: true })

  if (error) {
    console.error('Error fetching items from Supabase:', error)
    throw error
  }

  return data || []
}

export async function createItem(itemData) {
  const { data, error } = await supabase
    .from('items')
    .insert({
      code: itemData.code?.trim().toUpperCase(),
      name: itemData.name?.trim(),
      type: itemData.type || 'finished_good',
      unit_of_measure: itemData.unit_of_measure?.trim() || 'pcs',
      standard_cost: Number(itemData.standard_cost) || 0,
      description: itemData.description?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating item:', error)
    if (error.code === '23505') {
      throw new Error(`An item with code "${itemData.code}" already exists. Item codes must be unique.`)
    }
    throw error
  }

  return data
}

export async function updateItem(id, itemData) {
  const { data, error } = await supabase
    .from('items')
    .update({
      code: itemData.code?.trim().toUpperCase(),
      name: itemData.name?.trim(),
      type: itemData.type,
      unit_of_measure: itemData.unit_of_measure?.trim() || 'pcs',
      standard_cost: Number(itemData.standard_cost) || 0,
      description: itemData.description?.trim() || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating item:', error)
    if (error.code === '23505') {
      throw new Error(`An item with code "${itemData.code}" already exists. Item codes must be unique.`)
    }
    throw error
  }

  return data
}

export async function deleteItem(id) {
  // Check if item is used in any sales orders
  const { count: salesOrderCount, error: checkError } = await supabase
    .from('sales_orders')
    .select('id', { count: 'exact', head: true })
    .eq('item_id', id)

  if (!checkError && salesOrderCount > 0) {
    throw new Error(
      `Cannot delete this item because it is referenced by ${salesOrderCount} sales order${salesOrderCount > 1 ? 's' : ''}.`
    )
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting item:', error)
    // Foreign key violation error code in PostgreSQL is 23503
    if (error.code === '23503') {
      throw new Error('Cannot delete this item because it is referenced by other records (e.g. BOM tree or orders).')
    }
    throw error
  }

  return true
}
