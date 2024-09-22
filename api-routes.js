const router = require('express').Router()
const db = require('./db')


router
  .route('/inventory')

  .get(async (req, res) => {
    try {
      const [items] = await db.query('SELECT * FROM inventory')
      res.json(items)
    } catch (error) {
      res.status(500).send('Error retrieving inventory')
    }
  })

  .post(async (req, res) => {
    const { name, image, description, price, quantity } = req.body
    if (!name || !image || !description || !price || !quantity) {
      return res.status(400).send('All fields are required')
    }
    try {
      await db.query(
        'INSERT INTO inventory (name, image, description, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [name, image, description, price, quantity]
      )
      res.status(204).end()
    } catch (error) {
      res.status(500).send('Error adding inventory item')
    }
  })

router
  .route('/inventory/:id')

  .get(async (req, res) => {
    const { id } = req.params
    try {
      const [[item]] = await db.query('SELECT * FROM inventory WHERE id = ?', [id])
      if (!item) return res.status(404).send('Item not found')
      res.json(item)
    } catch (error) {
      res.status(500).send('Error retrieving inventory item')
    }
  })

  .put(async (req, res) => {
    const { id } = req.params
    const { name, image, description, price, quantity } = req.body
    try {
      const [result] = await db.query(
        'UPDATE inventory SET name=?, image=?, description=?, price=?, quantity=? WHERE id=?',
        [name, image, description, price, quantity, id]
      )
      if (result.affectedRows === 0) return res.status(404).send('Item not found')
      res.status(204).end()
    } catch (error) {
      res.status(500).send('Error updating inventory item')
    }
  })

  .delete(async (req, res) => {
    const { id } = req.params
    try {
      const [result] = await db.query('DELETE FROM inventory WHERE id = ?', [id])
      if (result.affectedRows === 0) return res.status(404).send('Item not found')
      res.status(204).end()
    } catch (error) {
      res.status(500).send('Error deleting inventory item')
    }
  })


router
  .route('/cart')
  .get(async (req, res) => {
    const [cartItems] = await db.query(
      `SELECT
        cart.id,
        cart.inventory_id AS inventoryId,
        cart.quantity,
        inventory.price,
        inventory.name,
        inventory.image,
        inventory.quantity AS inventoryQuantity
      FROM cart INNER JOIN inventory ON cart.inventory_id=inventory.id`
    )
    const [[{total}]] = await db.query(
      `SELECT SUM(cart.quantity * inventory.price) AS total
       FROM cart, inventory WHERE cart.inventory_id=inventory.id`
    )
    res.json({cartItems, total: total || 0})
  })
  .post(async (req, res) => {
    const {inventoryId, quantity} = req.body
    const [[item]] = await db.query(
      `SELECT
        inventory.id,
        name,
        price,
        inventory.quantity AS inventoryQuantity,
        cart.id AS cartId
      FROM inventory
      LEFT JOIN cart on cart.inventory_id=inventory.id
      WHERE inventory.id=?;`,
      [inventoryId]
    )
    if (!item) return res.status(404).send('Item not found')
    const {cartId, inventoryQuantity} = item
    if (quantity > inventoryQuantity)
      return res.status(409).send('Not enough inventory')
    if (cartId) {
      await db.query(
        `UPDATE cart SET quantity=quantity+? WHERE inventory_id=?`,
        [quantity, inventoryId]
      )
    } else {
      await db.query(
        `INSERT INTO cart(inventory_id, quantity) VALUES (?,?)`,
        [inventoryId, quantity]
      )
    }
    res.status(204).end()
  })
  .delete(async (req, res) => {
 
    await db.query('DELETE FROM cart')
    res.status(204).end()
  })

router
  .route('/cart/:cartId')
  .put(async (req, res) => {
    const {quantity} = req.body
    const [[cartItem]] = await db.query(
      `SELECT
        inventory.quantity as inventoryQuantity
        FROM cart
        INNER JOIN inventory on cart.inventory_id=inventory.id
        WHERE cart.id=?`,
      [req.params.cartId]
    )
    if (!cartItem)
      return res.status(404).send('Not found')
    const {inventoryQuantity} = cartItem
    if (quantity > inventoryQuantity)
      return res.status(409).send('Not enough inventory')
    if (quantity > 0) {
      await db.query(
        `UPDATE cart SET quantity=? WHERE id=?`,
        [quantity, req.params.cartId]
      )
    } else {
      await db.query(
        `DELETE FROM cart WHERE id=?`,
        [req.params.cartId]
      )
    }
    res.status(204).end()
  })
  .delete(async (req, res) => {
    const [{affectedRows}] = await db.query(
      `DELETE FROM cart WHERE id=?`,
      [req.params.cartId]
    )
    if (affectedRows === 1)
      res.status(204).end()
    else
      res.status(404).send('Cart item not found')
  })

module.exports = router
