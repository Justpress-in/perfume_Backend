# Oud Al-Anood — API Reference

Base URL: `http://localhost:5000/api`

All protected admin endpoints require `Authorization: Bearer <accessToken>`.
Website user endpoints use the same header scheme but a user token.

---

## 1. Admin Auth — `/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | public | Admin login → returns tokens |
| POST | `/auth/refresh` | public | Refresh access token |
| POST | `/auth/logout` | admin | Invalidate refresh token |
| GET  | `/auth/me` | admin | Current admin profile |

## 2. Admin Management — `/admins` (superadmin only)
| Method | Path | Description |
|---|---|---|
| GET | `/admins` | List admins |
| GET | `/admins/:id` | Get admin |
| POST | `/admins` | Create admin |
| PUT | `/admins/:id` | Update admin |
| PUT | `/admins/:id/password` | Reset password |
| DELETE | `/admins/:id` | Delete admin |

## 3. Website Users — `/users`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users/register` | public | Register |
| POST | `/users/login` | public | Login |
| POST | `/users/refresh` | public | Refresh token |
| POST | `/users/logout` | user | Logout |
| GET  | `/users/me` | user | Current profile |
| PUT  | `/users/me` | user | Update profile |
| PUT  | `/users/me/password` | user | Change password |
| GET  | `/users/me/addresses` | user | List addresses |
| POST | `/users/me/addresses` | user | Add address |
| PUT  | `/users/me/addresses/:id` | user | Update address |
| DELETE | `/users/me/addresses/:id` | user | Delete address |
| GET  | `/users/me/wishlist` | user | Get wishlist |
| POST | `/users/me/wishlist` | user | Toggle wishlist item |
| DELETE | `/users/me/wishlist/:productId` | user | Remove from wishlist |
| GET  | `/users/me/orders` | user | My orders |
| GET  | `/users` | admin | List all users |
| GET  | `/users/:id` | admin | Get user |
| PUT  | `/users/:id` | admin | Update user (wholesale, active…) |
| DELETE | `/users/:id` | superadmin | Deactivate user |

## 4. Products — `/products`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | public | List (filters: category, subcategory, search, isActive, page, limit) |
| GET | `/products/:id` | public | Get one |
| POST | `/products` | admin | Create |
| PUT | `/products/:id` | admin | Full update |
| PATCH | `/products/:id` | admin | Quick update (price, stock, featured) |
| POST | `/products/:id/image` | admin | Upload image (multipart `image`) |
| DELETE | `/products/:id` | superadmin | Soft delete |

## 5. Orders — `/orders`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | public | Create order (checkout) |
| GET | `/orders` | admin | List orders (filters: status, channel, date range) |
| GET | `/orders/export` | superadmin | CSV export |
| GET | `/orders/:id` | admin | Get by `_id` or `orderId` |
| PATCH | `/orders/:id/status` | admin | Update status |

## 6. Blog — `/blog`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/blog` | public | List posts |
| GET | `/blog/:idOrSlug` | public | Get post |
| POST | `/blog` | admin | Create post |
| PUT | `/blog/:id` | admin | Update |
| PATCH | `/blog/:id/publish` | admin | Toggle publish |
| DELETE | `/blog/:id` | superadmin | Delete |

## 7. Stores — `/stores`
`GET /stores`, `GET /stores/:id`, `POST`, `PUT`, `DELETE`

## 8. Testimonials — `/testimonials`
`GET`, `GET /:id`, `POST`, `PUT`, `DELETE`

## 9. Categories — `/categories`
`GET`, `GET /:idOrSlug`, `POST`, `PUT`, `DELETE`

## 10. Offers — `/offers`
`GET` (filters: `current=true`, `isActive`), `GET /:id`, `POST`, `PUT`, `DELETE`

## 11. Banners / Homepage CMS — `/banners`
Filter by `section=hero|promo|brand|homepage|shop|about|custom`. Full CRUD.

## 12. Contact — `/contact`
| Method | Path | Auth |
|---|---|---|
| POST | `/contact` | public (form submission) |
| GET | `/contact` | admin |
| GET | `/contact/:id` | admin |
| PUT | `/contact/:id` | admin (reply/status) |
| DELETE | `/contact/:id` | superadmin |

## 13. Newsletter — `/newsletter`
| Method | Path | Auth |
|---|---|---|
| POST | `/newsletter/subscribe` | public |
| POST | `/newsletter/unsubscribe` | public |
| GET | `/newsletter` | admin |
| GET | `/newsletter/export` | superadmin (CSV) |
| DELETE | `/newsletter/:id` | superadmin |

## 14. Wholesale — `/wholesale`
| Method | Path | Auth |
|---|---|---|
| POST | `/wholesale` | public |
| GET | `/wholesale` | admin |
| GET | `/wholesale/:id` | admin |
| PUT | `/wholesale/:id` | admin |
| DELETE | `/wholesale/:id` | superadmin |

## 15. Coupons — `/coupons`
| Method | Path | Auth |
|---|---|---|
| POST | `/coupons/validate` | public (checkout) |
| GET / POST / PUT / DELETE | CRUD | admin |

## 16. Reviews — `/reviews`
| Method | Path | Auth |
|---|---|---|
| GET | `/reviews/product/:productId` | public (approved only) |
| POST | `/reviews` | optional user auth |
| GET | `/reviews` | admin (moderation queue) |
| PUT | `/reviews/:id` | admin |
| PATCH | `/reviews/:id/approve` | admin |
| DELETE | `/reviews/:id` | superadmin |

## 17. Settings — `/settings`
- `GET /settings` — public (site config for frontend)
- `PUT /settings` — superadmin

## 18. Analytics — `/analytics` (admin)
- `GET /analytics/summary`
- `GET /analytics/products` (top sellers)
- `GET /analytics/orders/timeline` (last 30d)
- `GET /analytics/channels`

## 19. Uploads — `/uploads`
- `POST /uploads/image` (admin, multipart `image`)
- `POST /uploads/images` (admin, multipart `images[]`, max 10)

---

## Setup

```bash
cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_* secrets
npm install
npm run seed              # creates demo admin, customer, products, etc.
npm run dev               # starts on :5000
```

## Demo credentials
- **Admin** — `admin@oudalnood.com` / `Admin@1234`
- **Customer** — `customer@example.com` / `Customer@123`

## Postman
Import `backend/postman/OudAlAnood.postman_collection.json` and optionally the environment file `OudAlAnood.postman_environment.json`.
Login requests auto-save tokens into collection variables so subsequent requests work immediately.
