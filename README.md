# Inventory & Data Management System (Assignment 3)

Node.js + Express + MongoDB (Mongoose) + dotenv.

## Run
```bash
npm install
# make sure MongoDB is running locally (or edit MONGO_URI in .env)
npm run seed     # optional: 12 sample products
npm start        # http://localhost:5000
```

## Endpoints
| Method | URL | Purpose |
|---|---|---|
| POST | /api/products | Create product (201) |
| GET | /api/products | List with filter/sort/pagination |
| GET | /api/products/:id | Single product |
| PUT | /api/products/:id | Update details |
| PATCH | /api/products/:id/stock | Body `{"change": 10}` restock, `{"change": -3}` sale |
| DELETE | /api/products/:id | Delete |
| GET | /api/products/low-stock | quantity <= reorderLevel |
| GET | /api/products/summary | Category-wise aggregation |

### Query params for GET /api/products
`category`, `supplier`, `search`, `minPrice`, `maxPrice`, `inStock=true|false`,
`sort=-price,name`, `page=1`, `limit=10`

Example: `/api/products?category=Electronics&minPrice=500&sort=-price&page=1&limit=5`

### Sample create body
```json
{ "name": "Gel Pen Pack of 15", "sku": "STNY-PN-713", "category": "Stationery",
  "price": 120, "quantity": 40, "reorderLevel": 20, "supplier": "Cello Pens" }
```
