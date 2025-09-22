# Montessori School Management System (Monte SMS)

A comprehensive school management system designed specifically for Montessori schools, featuring role-based access control and modern web technologies.

## 🚀 Features

### **Core Functionality**
- **Multi-role Authentication**: Parent, Teacher, and Admin access levels
- **Student Management**: Comprehensive child profiles with medical info and emergency contacts
- **Learning Documentation**: Observations, portfolio entries, and learning path tracking
- **Team Management**: Multi-tenant organization with subscription billing

### **🔒 Security Features (Recently Enhanced)**
- **Advanced Middleware Protection**: Role-based access control for all authenticated routes
- **Comprehensive Access Logging**: Full audit trail with IP tracking and metadata
- **Session Management**: Automatic invalidation on role changes
- **GDPR & OWASP Compliant**: Production-ready security implementation

## 🛠 Tech Stack

- **Framework**: Next.js 15 with React 19
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with NextAuth.js
- **UI**: shadcn/ui components with Tailwind CSS
- **Payments**: Stripe integration for subscriptions
- **Testing**: Vitest + Testing Library
- **Linting**: Biome

## 📂 Project Structure

```
monte-sms/
├── app/                    # Next.js application
│   ├── app/
│   │   ├── (admin)/       # Admin-only routes
│   │   ├── (teacher)/     # Teacher routes
│   │   ├── (parent)/      # Parent routes
│   │   ├── (dashboard)/   # Shared dashboard
│   │   └── unauthorized/  # Access denied page
│   ├── lib/
│   │   ├── db/           # Database schema and utilities
│   │   │   ├── access-log.ts  # Access logging system
│   │   │   ├── route.ts       # Route permissions
│   │   │   └── schema.ts      # Database schema
│   │   └── auth/         # Authentication utilities
│   ├── middleware.ts     # Enhanced security middleware
│   └── components/       # Reusable UI components
└── specs/               # Feature specifications
    └── 002-expand-middleware-protection/  # Security implementation docs
```

## 🔐 Authentication & Access Control

### **Role-Based Access**
- **Admin**: Full system access (`/admin/*`, `/teacher/*`, `/parent/*`, `/dashboard/*`)
- **Teacher**: Classroom management (`/teacher/*`, `/dashboard/*`)
- **Parent**: Child information access (`/parent/*`, `/dashboard/*`)

### **Security Middleware**
- Protects all authenticated routes: `/admin/*`, `/teacher/*`, `/parent/*`, `/dashboard/*`
- Automatic redirects to `/unauthorized` for insufficient permissions
- Session invalidation on role changes
- Comprehensive access logging with metadata

### **Test Accounts**
- **Admin**: `admin@montessori-academy.edu` / `admin123`
- **Teacher**: `sarah.teacher@montessori-academy.edu` / `teacher123`
- **Parent**: `john.parent@example.com` / `parent123`

## 🚦 Getting Started

### **Prerequisites**
- Node.js 18+ and pnpm
- PostgreSQL database
- Stripe account (for payments)

### **Installation**
```bash
cd app
pnpm install
```

### **Database Setup**
```bash
# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate and run migrations
pnpm db:generate
pnpm db:migrate

# Seed with sample data (optional)
pnpm db:seed
```

### **Development**
```bash
pnpm dev
```

### **Testing**
```bash
# Run all tests
pnpm test:run

# Run with UI
pnpm test:ui

# Performance tests
pnpm test:run __tests__/performance.test.ts
```

## 📊 Database Schema

### **Core Tables**
- `users` - Authentication and role management
- `teams` - Multi-tenant team system
- `schools` - School information and settings
- `children` - Student profiles with medical info
- `access_logs` - Security audit trail (NEW)

### **Montessori-Specific**
- `observations` - Teacher observations of student activities
- `portfolio_entries` - Documentation of student work
- `learning_paths` - Curriculum tracking and progression

## 🔍 Monitoring & Logging

### **Access Logs**
All user access is logged with:
- User ID and role
- Route accessed
- Event type (access_granted, access_denied, login, logout)
- IP address and user agent
- Timestamp and metadata

### **Event Types**
- `login` - User authentication
- `access_granted` - Successful route access
- `access_denied` - Unauthorized access attempt
- `logout` - Session termination
- `session_invalidated` - Role change detection

## 📝 Recent Updates

### **Security Enhancement (v2.0)**
- ✅ Expanded middleware protection to all authenticated routes
- ✅ Implemented comprehensive role-based access control
- ✅ Added detailed access logging with audit trail
- ✅ Enhanced session management with role change detection
- ✅ GDPR and OWASP compliance improvements

## 🤝 Contributing

This project follows modern development practices:
- **TypeScript** for type safety
- **Biome** for linting and formatting
- **Test-driven development** with Vitest
- **Database migrations** with Drizzle
- **Security-first** approach

## 📄 License

Private project for Montessori school management.