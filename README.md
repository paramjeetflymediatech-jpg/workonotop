# WorkOnTap Admin Panel

A clean and modern admin dashboard for WorkOnTap built with **Next.js 15 (App Router)**, **MySQL**, and **Tailwind CSS**.

## 🚀 Features

- ✅ Next.js 15 with App Router (Latest)
- ✅ Clean folder structure
- ✅ MySQL database (no Prisma, no TypeScript)
- ✅ Dashboard with 6 statistics cards
- ✅ Job requests management
- ✅ Tradespeople management
- ✅ Reviews management
- ✅ Modern UI with Tailwind CSS & glassmorphism effects
- ✅ Responsive design
- ✅ Simple authentication

## 📋 Prerequisites

- Node.js 18+ or 20+
- MySQL 5.7+ or 8.0+
- npm or yarn

## 🛠️ Installation

### 1. Extract the ZIP file

```bash
unzip workontap-admin.zip
cd workontap-admin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

Import the schema into your MySQL database:

```bash
mysql -u your_username -p your_database < database/schema.sql
```

Or run the SQL queries from `database/schema.sql` manually in your MySQL client (phpMyAdmin, MySQL Workbench, etc.)

### 4. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=workontap_db
DB_PORT=3306

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 5. Run the Application

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

Visit: `http://localhost:3000`

## 🔐 Default Login

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Change these in `.env` for production!**

## 📁 Project Structure

```
workontap-admin/
├── src/
│   ├── app/                    # App Router
│   │   ├── admin/             # Admin dashboard
│   │   │   └── page.js
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   │       └── route.js
│   │   │   ├── job-requests/
│   │   │   │   └── route.js
│   │   │   ├── tradespeople/
│   │   │   │   └── route.js
│   │   │   ├── reviews/
│   │   │   │   └── route.js
│   │   │   └── stats/
│   │   │       └── route.js
│   │   ├── layout.js          # Root layout
│   │   ├── page.js            # Login page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── Navbar.js
│   │   └── StatCard.js
│   └── lib/                   # Utilities
│       └── db.js              # Database connection
├── database/
│   └── schema.sql             # Database schema
├── package.json
├── next.config.js
├── tailwind.config.js
└── .env.example
```

## 📊 Database Tables

### `job_requests`
Customer job requests with status tracking
- Fields: id, name, phone, location, service_type, status, created_at, updated_at

### `tradespeople`
Tradesperson profiles and information
- Fields: id, name, email, phone, trade, location, rating, total_jobs, status, created_at, updated_at

### `reviews`
Customer reviews for tradespeople
- Fields: id, tradesperson_id, customer_name, rating, comment, created_at

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Job Requests
- `GET /api/job-requests` - Get all requests
- `POST /api/job-requests` - Create request
- `PUT /api/job-requests` - Update status
- `DELETE /api/job-requests?id={id}` - Delete request

### Tradespeople
- `GET /api/tradespeople` - Get all tradespeople
- `DELETE /api/tradespeople?id={id}` - Delete tradesperson

### Reviews
- `GET /api/reviews` - Get all reviews
- `DELETE /api/reviews?id={id}` - Delete review

### Statistics
- `GET /api/stats` - Get dashboard stats

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#14b8a6',   // Change this
      secondary: '#0d9488',  // Change this
    },
  },
}
```

### Change Fonts

Edit `src/app/globals.css` and update the Google Fonts import.

## 🚀 Production Deployment

1. Build:
```bash
npm run build
```

2. Start:
```bash
npm start
```

3. Use PM2 (recommended):
```bash
npm install -g pm2
pm2 start npm --name "workontap-admin" -- start
pm2 save
pm2 startup
```

## 🔧 Troubleshooting

### Database Connection Failed
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists
- Verify port (default: 3306)

### Port Already in Use
Change port in `package.json`:
```json
"dev": "next dev -p 3001"
```

### Build Errors
Clear cache and rebuild:
```bash
rm -rf .next
npm run build
```

## 📝 Notes

- Sample data is included in the schema
- Uses localStorage for simple auth (not production-ready for complex needs)
- All dates in database use TIMESTAMP with automatic updates
- Responsive design works on mobile, tablet, and desktop

## 🆘 Support

For issues, please check:
1. Database connection
2. Environment variables
3. Node.js version (18+ required)
4. MySQL version compatibility

## 📄 License

MIT License
