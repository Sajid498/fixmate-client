
# FixMate – Smart Device & Home Appliance Repair Platform

FixMate is a full-stack repair service platform that connects customers with professional technicians for smartphone, laptop, air conditioner, refrigerator, television, washing machine, and electrical appliance repairs.

Customers can discover services, request repairs, track booking progress, and pay after successful completion. Technicians can manage their services and repair requests, while administrators manage users, service approvals, bookings, and payments.

## Live Application

- Frontend: To be added after deployment.
- Backend API: To be added after deployment.

## Main Features

### Authentication and Authorization
- User registration and sign-in.
- Role-based access for customers, technicians, and administrators.
- Protected dashboard routes.
- Persistent authentication sessions.

### Customer Features
- Browse approved repair services.
- Search, filter, and sort services.
- View detailed service information.
- Submit repair requests.
- Track booking status.
- Cancel requests while they are still requested.
- Pay for completed repair jobs.
- View payment history.
- Manage profile information.

### Technician Features
- Create and manage repair services.
- Submit services for administrator approval.
- Manage service availability.
- View incoming repair requests.
- Accept or reject requests.
- Update repair progress.
- Mark jobs as completed with a final amount.
- Manage profile information.

### Administrator Features
- View dashboard statistics.
- Manage user roles.
- Approve or reject submitted services.
- Manage bookings.
- View payment transactions and revenue reports.

### Payment Features
- Stripe Checkout integration.
- Development payment simulator for local development.
- Payment verification.
- Prevention of duplicate booking payments.
- Customer and administrator payment histories.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth
- MongoDB
- Stripe
- Lucide React
- Sonner
- React Hook Form
- Zod

## Project Structure

```text
fixmate-client/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   ├── customer/
│   │   │   └── technician/
│   │   ├── payment/
│   │   ├── profile/
│   │   ├── services/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── components/
│   └── lib/
├── .env.example
├── package.json
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
cd fixmate-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_SECRET=YOUR_SECRET
BETTER_AUTH_URL=http://localhost:3000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
NEXT_PUBLIC_PAYMENT_CURRENCY=BDT
```

Use the same authentication secret and appropriate MongoDB connection settings as the backend configuration.

Never commit `.env.local` or expose production credentials.

### 4. Start development server

```bash
npm run dev
```

Open:

http://localhost:3000

### 5. Production build

```bash
npm run build
npm start
```

## User Roles

| Role | Access |
|---|---|
| Customer | Browse services, request repairs, manage bookings and payments |
| Technician | Manage services and repair requests |
| Admin | Manage users, services, bookings and payments |

Public registration is available for customers and technicians. Administrator access must be assigned through a trusted server-side process.

## Booking Workflow

```text
Customer submits repair request
            |
            v
       Requested
            |
      +-----+-----+
      |           |
      v           v
   Accepted    Rejected
      |
      v
  In Progress
      |
      v
   Completed
      |
      v
 Customer Payment
```

Customers can cancel a request while it remains in the requested state.

## Payment Configuration

The project supports Stripe Checkout and a development-only payment simulator.

Configure the backend payment environment variables to select the appropriate payment mode.

The development simulator must remain disabled in production. It does not process real money.

## Deployment

The frontend is designed for deployment on Vercel.

Before deployment:

1. Configure production environment variables.
2. Set the correct backend API URL.
3. Configure Better Auth trusted origins.
4. Configure the production backend URL.
5. Verify authentication and payment redirect URLs.
6. Confirm that the backend allows the deployed frontend origin.

## Demo Accounts

Demo credentials will be added after final testing and account creation.

| Role | Email | Password |
|---|---|---|
| Admin | To be added | To be added |
| Technician | To be added | To be added |
| Customer | To be added | To be added |

## Related Repository

Backend repository: To be added.

## Project Status

Development and implementation are in progress. Final end-to-end testing and deployment will be completed before submission.