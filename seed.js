// Optional: npm run seed  -> inserts 12 sample products (clears existing ones)
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const data = [
  { name: 'Study Table', sku: 'FURN-TB-812', category: 'Furniture', price: 3999, quantity: 2, reorderLevel: 4, supplier: 'IKEA India' },
  { name: 'Office Chair', sku: 'FURN-CH-101', category: 'Furniture', price: 5499, quantity: 15, reorderLevel: 5, supplier: 'Godrej Interio' },
  { name: 'Laptop 15"', sku: 'ELEC-LP-001', category: 'Electronics', price: 54999, quantity: 6, reorderLevel: 5, supplier: 'Lenovo' },
  { name: 'Wireless Mouse', sku: 'ELEC-MS-002', category: 'Electronics', price: 799, quantity: 60, reorderLevel: 20, supplier: 'Logitech' },
  { name: 'Smartphone', sku: 'ELEC-PH-003', category: 'Electronics', price: 18999, quantity: 4, reorderLevel: 8, supplier: 'Samsung' },
  { name: 'Bluetooth Speaker', sku: 'ELEC-SP-004', category: 'Electronics', price: 1999, quantity: 26, reorderLevel: 10, supplier: 'boAt' },
  { name: 'Cotton T-Shirt', sku: 'APPR-TS-201', category: 'Apparel', price: 599, quantity: 50, reorderLevel: 15, supplier: 'Allen Solly' },
  { name: 'Denim Jeans', sku: 'APPR-JN-202', category: 'Apparel', price: 2199, quantity: 28, reorderLevel: 10, supplier: "Levi's" },
  { name: 'Notebook A4', sku: 'STNY-NB-701', category: 'Stationery', price: 60, quantity: 200, reorderLevel: 50, supplier: 'Classmate' },
  { name: 'Marker Set', sku: 'STNY-MK-702', category: 'Stationery', price: 250, quantity: 8, reorderLevel: 20, supplier: 'Camlin' },
  { name: 'Rice 5kg', sku: 'GROC-RC-301', category: 'Grocery', price: 450, quantity: 80, reorderLevel: 25, supplier: 'India Gate' },
  { name: 'Olive Oil 1L', sku: 'GROC-OL-302', category: 'Grocery', price: 899, quantity: 3, reorderLevel: 10, supplier: 'Figaro' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(data);
  console.log(`Seeded ${data.length} products`);
  process.exit(0);
})();
