# Data Model for Admin Dashboard Refactor

## Entities

### AdminCard
- **id**: string
- **title**: string
- **description**: string
- **dataType**: string (e.g., "user", "class", "payment")
- **actions**: string[] (e.g., ["view", "edit", "delete"])

### AdminUser
- **id**: string
- **name**: string
- **role**: string ("admin")
- **permissions**: string[]

### DatabaseEntity (example: User)
- **id**: string
- **name**: string
- **email**: string
- **role**: string

### DatabaseEntity (example: Class)
- **id**: string
- **name**: string
- **teacherId**: string

### DatabaseEntity (example: Payment)
- **id**: string
- **userId**: string
- **amount**: number
- **date**: string

## Relationships
- AdminUser can access multiple AdminCards
- AdminCard displays/manages data from a DatabaseEntity
- DatabaseEntities may reference each other (e.g., Payment references User)

## Validation Rules
- All IDs must be unique UUIDs
- Actions must be valid for the card's dataType
- Permissions must be enforced via RBAC

---
*Entities and relationships will be refined as unknowns are resolved.*
