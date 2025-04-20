'use client'

import { useState } from "react"
import { Reorder } from "framer-motion"

export default function Test() {
  const [items, setItems] = useState([0, 1, 2, 3])

  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems}>
      {items.map((item) => (
        <Reorder.Item key={item} value={item}>
          {item}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}