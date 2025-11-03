# 🍼 BabyJoy Ghana - Point of Sale System

A modern, role-based Point of Sale (POS) system designed specifically for baby product stores in Ghana. Built with React, Django, and TypeScript, featuring comprehensive inventory management, sales tracking, and user role management with Ghana Cedis (₵) currency support.

![BabyJoy POS System](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Django](https://img.shields.io/badge/Django-5.2.7-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)

## 🌟 Features

### 🔐 **Role-Based Access Control**
- **6 User Roles**: Super Admin, Admin, Manager, Cashier, Staff, Viewer
- **Permission System**: Granular access control for different features
- **Secure Authentication**: Token-based authentication with Django REST Framework

### 💰 **Ghana-Specific Features**
- **Ghana Cedis (₵)** currency formatting throughout
- **15% Tax Rate** (12.5% VAT + 2.5% NHIL)
- **Local Payment Methods**: Cash, Mobile Money (MoMo), Card, Bank Transfer
- **Ghana Phone Numbers**: +233 format support
- **Professional Receipts**: Ghana-formatted receipts with VAT details

### 📊 **Comprehensive Analytics**
- **Interactive Charts**: Sales trends, payment methods, top products
- **Real-time Dashboard**: Revenue metrics, inventory alerts, sales performance
- **Dynamic Data**: All charts connected to real backend data
- **Export Functionality**: CSV export for sales data

### 🛒 **Point of Sale System**
- **Product Search**: Fast product lookup and cart management
- **Inventory Tracking**: Real-time stock updates and low stock alerts
- **Receipt Printing**: Professional receipts with store branding
- **Multiple Payment Methods**: Support for various payment types

### 📦 **Inventory Management**
- **Product CRUD**: Complete product lifecycle management
- **Stock Tracking**: Automatic inventory updates on sales
- **Reorder Alerts**: Low stock notifications
- **Category Management**: Organize products by categories

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   ├── ErrorBoundary.tsx
│   │   ├── PermissionGuard.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleHelp.tsx
│   │   └── RoleBasedNavigation.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── libs/              # Utilities and API functions
│   │   ├── api.ts         # API client with authentication
│   │   └── utils.ts       # Helper functions
│   ├── pages/             # Application pages
│   │   ├── Dashboard.tsx  # Main dashboard with charts
│   │   ├── POS.tsx        # Point of sale interface
│   │   ├── Products.tsx   # Product management
│   │   ├── Sales.tsx      # Sales history and management
│   │   ├── Analytics.tsx  # Business analytics
│   │   ├── Users.tsx      # User management
│   │   ├── Login.tsx      # Authentication
│   │   └── Settings.tsx   # System settings
│   └── main.tsx           # Application entry point
├── package.json
└── pnpm-lock.yaml
```

### Backend (Django + PostgreSQL)
```
backend/
├── api/
│   ├── models.py          # Database models
│   ├── views.py           # API endpoints
│   ├── serializers.py     # Data serialization
│   ├── permissions.py     # Role-based permissions
│   ├── urls.py            # API routing
│   └── admin.py           # Django admin interface
├── backend_project/
│   ├── settings.py        # Django configuration
│   └── urls.py            # Main URL routing
├── manage.py
├── Pipfile                # Python dependencies
└── .env                   # Environment variables
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **pnpm**
- **Python** 3.13+ and **pipenv**
- **PostgreSQL** (or SQLite for development)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/babyjoy-ghana-pos.git
cd babyjoy-ghana-pos
```

### 2. Backend Setup
```bash
cd backend
pipenv install
pipenv shell

# Configure environment variables
cp .env.example .env
# Edit .env with your database settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start Django server
python manage.py runserver 8000
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install

# Start development server
pnpm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://127.0.0.1:8000
- **Django Admin**: http://127.0.0.1:8000/admin

## 👥 User Roles & Permissions

| Role | Dashboard | Products | POS | Sales | Analytics | Users | Settings |
|------|-----------|----------|-----|-------|-----------|-------|----------|
| **Super Admin** | ✅ Full | ✅ Manage | ✅ Access | ✅ Manage | ✅ View | ✅ Manage | ✅ Manage |
| **Admin** | ✅ View | ✅ Manage | ✅ Access | ✅ Manage | ✅ View | ✅ Manage | ❌ No |
| **Manager** | ✅ View | ✅ Manage | ✅ Access | ✅ View | ✅ View | ❌ No | ❌ No |
| **Cashier** | ✅ View | ✅ View | ✅ Access | ✅ View | ❌ No | ❌ No | ❌ No |
| **Staff** | ✅ View | ✅ View | ✅ Access | ❌ No | ❌ No | ❌ No | ❌ No |
| **Viewer** | ✅ View | ✅ View | ❌ No | ✅ View | ❌ No | ❌ No | ❌ No |

## 🔑 Default Accounts

### Admin Account
- **Email**: `admin@babyjoy.com.gh`
- **Password**: `admin123`
- **Role**: Super Administrator

### Test Cashier Account
- **Email**: `cashier@babyjoy.com.gh`
- **Password**: `test123`
- **Role**: Cashier

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **pnpm** - Efficient package manager
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible UI components
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Recharts** - Interactive charts and analytics
- **Lucide React** - Beautiful icons

### Backend
- **Django 5.2.7** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Production database
- **Token Authentication** - Secure API access
- **CORS Headers** - Cross-origin resource sharing
- **Python Dotenv** - Environment variable management

## 📱 Key Features

### 🏪 **Point of Sale**
- Fast product search and selection
- Shopping cart management
- Multiple payment method support
- Real-time inventory updates
- Professional receipt generation
- Ghana Cedis currency formatting

### 📈 **Analytics & Reporting**
- Daily sales trend charts
- Payment method distribution
- Top-selling products analysis
- Revenue and order metrics
- Low stock inventory alerts
- Exportable sales reports

### 👨‍💼 **User Management**
- Role-based access control
- User performance tracking
- Sales attribution to cashiers
- Permission management
- User activity monitoring

### 🎯 **Business Intelligence**
- Real-time dashboard metrics
- Inventory management alerts
- Sales performance tracking
- Customer transaction history
- Business growth analytics

## 🔧 Development

### Available Scripts

#### Frontend (pnpm)
```bash
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run lint     # Run ESLint
```

#### Backend (pipenv)
```bash
python manage.py runserver    # Start Django server
python manage.py migrate      # Run database migrations
python manage.py shell        # Django shell
python manage.py test         # Run tests
```

### API Endpoints

#### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

#### Core Features
- `GET/POST /api/products/` - Product management
- `GET/POST /api/sales/` - Sales management
- `GET /api/analytics/` - Business analytics
- `GET /api/users/` - User management (Admin only)

#### Role Management
- `GET /api/users/permissions/` - Get user permissions
- `POST /api/users/update-role/` - Update user role

## 🌍 Ghana-Specific Customizations

### Currency & Taxation
- **Ghana Cedis (₵)** formatting throughout the system
- **15% Tax Rate** automatically calculated (VAT + NHIL)
- **Tax-inclusive pricing** with clear breakdown on receipts

### Payment Methods
- **Cash** - Traditional cash payments
- **Mobile Money (MoMo)** - Popular digital payment in Ghana
- **Card** - Credit/debit card payments
- **Bank Transfer** - Direct bank transfers

### Localization
- **Ghana phone format**: +233 XX XXX XXXX
- **Local business hours** and date formats
- **Ghana-specific product categories** for baby items
- **Professional receipts** with VAT registration display

## 🔒 Security Features

- **Token-based authentication** with automatic expiry handling
- **Role-based permissions** at both API and UI levels
- **Protected routes** with automatic login redirects
- **CORS protection** for API security
- **Input validation** and sanitization
- **Error boundaries** for graceful error handling

## 📊 Sample Data

The system includes sample data for testing:
- **8 Baby Products** - Diapers, formula, bottles, etc.
- **Multiple Sales** - Various payment methods and customers
- **User Roles** - Different access levels for testing
- **Ghana-specific** - Names, addresses, and phone numbers

## 🚧 Development Status

**Current Version**: 1.0.0-beta
**Status**: In Active Development

### ✅ Completed Features
- [x] User authentication and role management
- [x] Product inventory management
- [x] Point of sale system
- [x] Sales tracking and reporting
- [x] Dynamic analytics with charts
- [x] Ghana currency and tax integration
- [x] Role-based access control
- [x] Professional receipt printing

### 🔄 In Progress
- [ ] Advanced reporting features
- [ ] Customer management system
- [ ] Inventory forecasting
- [ ] Multi-store support
- [ ] Mobile app companion

### 📋 Planned Features
- [ ] Barcode scanning integration
- [ ] Supplier management
- [ ] Advanced analytics
- [ ] Backup and restore
- [ ] API documentation
- [ ] Unit tests coverage

## 🤝 Contributing

This project is currently in development. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for beautiful UI components
- **Recharts** for interactive data visualization
- **Django REST Framework** for robust API development
- **React Query** for efficient data management
- **Tailwind CSS** for rapid UI development

## 📞 Support

For support, email support@babyjoy.com.gh or create an issue in this repository.

---

**Built with ❤️ for baby product retailers in Ghana**