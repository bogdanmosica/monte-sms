# API Contract: Admin Dashboard Card Data

## Endpoint: GET /api/admin/cards
- **Description**: Retrieve all admin dashboard cards and their data
- **Auth**: Admin only (RBAC)
- **Response**:
  - 200 OK: Array of AdminCard objects
  - 401 Unauthorized: If not admin

## Endpoint: GET /api/admin/card/:id
- **Description**: Retrieve data for a specific admin dashboard card
- **Auth**: Admin only (RBAC)
- **Response**:
  - 200 OK: AdminCard object
  - 404 Not Found: If card does not exist
  - 401 Unauthorized: If not admin

## Endpoint: POST /api/admin/card/:id/action
- **Description**: Perform an action (edit/delete) on a specific card
- **Auth**: Admin only (RBAC)
- **Request Body**:
  - action: string ("edit" | "delete")
  - payload: object (depends on action)
- **Response**:
  - 200 OK: Success message
  - 400 Bad Request: Invalid action or payload
  - 401 Unauthorized: If not admin
  - 404 Not Found: If card does not exist

---
*All endpoints require contract tests before implementation.*
