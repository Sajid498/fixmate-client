# FixMate – Smart Device & Home Appliance Repair Platform

FixMate is a full-stack repair service platform that connects customers with professional technicians for smartphone, laptop, air conditioner, refrigerator, television, washing machine, and electrical appliance repairs.

Customers can discover repair services, submit service requests, track booking progress, and pay after successful completion. Technicians can manage their services and repair requests, while administrators oversee users, service approvals, bookings, and payments.

## Live Application

- **Frontend:** https://fixmate-client-mu.vercel.app
- **Backend API:** https://fixmate-server-fqv6.onrender.com
- **Backend Health Check:** https://fixmate-server-fqv6.onrender.com/api/health

## Repositories

- **Frontend:** https://github.com/Sajid498/fixmate-client
- **Backend:** https://github.com/Sajid498/fixmate-server

## Key Features

### Authentication and Authorization
- User registration and sign-in.
- Role-based access for customers, technicians, and administrators.
- Protected dashboard routes.
- Persistent authentication sessions.
- Server-side authentication and authorization checks.

### Customer Features
- Browse approved repair services.
- Search, filter, and sort services.
- View detailed service information.
- Submit repair requests.
- Track booking progress.
- Cancel requests while their status is `Requested`.
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
- Complete jobs with a final repair amount.
- Manage profile information.

### Administrator Features
- View dashboard statistics.
- Manage user roles.
- Approve or reject submitted services.
- Monitor bookings.
- View payment transactions and revenue information.

### Payment Features
- Stripe Checkout integration.
- Development-only payment simulator for local testing.
- Payment verification.
- Duplicate booking payment prevention.
- Customer and administrator payment histories.

### Image Upload
- Service image upload integration using ImgBB.
- Image URLs are stored with service records and displayed in service listings and details.

## Technology Stack

| Category | Technologies |
|---|---|
| Framework | Next.js |
| UI Library | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication | Better Auth |
| Database | MongoDB |
| Payments | Stripe |
| Image Hosting | ImgBB |
| Icons | Lucide React |
| Notifications | Sonner |
| Forms | React Hook Form |
| Validation | Zod |

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

## Getting Started

### Prerequisites

- Node.js and npm.
- Access to the FixMate backend API.
- MongoDB configuration required by the authentication setup.

### 1. Clone the repository

```bash
git clone https://github.com/Sajid498/fixmate-client.git
cd fixmate-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

Use the following example as a guide and compare it with the repository's `.env.example` file before starting the application.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

BETTER_AUTH_SECRET=YOUR_AUTH_SECRET
BETTER_AUTH_URL=http://localhost:3000

MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING

NEXT_PUBLIC_PAYMENT_CURRENCY=bdt
```

**Configuration notes:**
- Use the appropriate local backend URL.
- Keep authentication secrets and database credentials private.
- Use the same authentication configuration required by the backend integration.
- Never commit `.env.local` or production credentials to GitHub.
- Only expose variables prefixed with `NEXT_PUBLIC_` when they are safe for browser access.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create a production build

```bash
npm run build
```

### 6. Start the production server

```bash
npm start
```

## User Roles and Permissions

| Role | Main Permissions |
|---|---|
| Customer | Browse services, request repairs, manage bookings, and make payments |
| Technician | Create and manage services, and process repair requests |
| Admin | Manage users, approve services, monitor bookings, and view payments |

Public registration is available for customers and technicians. Administrator privileges must be assigned through a trusted server-side process.

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

Customers can cancel a booking only while it remains in the `Requested` state.

## Payment Configuration

FixMate supports Stripe Checkout and a development-only payment simulator.

- Stripe mode requires valid backend Stripe credentials.
- Payment verification is handled by the backend.
- Payment amounts are determined by the booking information stored on the server.
- Duplicate payments are prevented.
- The development simulator is intended for local testing only and must not be enabled in production.

## Deployment

The frontend is deployed on Vercel.

**Production URL:** https://fixmate-client-mu.vercel.app

Before deploying another environment:

1. Configure the required environment variables.
2. Set the correct backend API URL.
3. Configure Better Auth URLs and trusted origins.
4. Verify authentication and payment redirect URLs.
5. Confirm that the backend allows the deployed frontend origin.
6. Run a production build and test the deployed application.

## Demo Accounts

Use dedicated demonstration accounts for evaluation. Add the verified account emails and passwords to the submission materials.

| Role | Email | Password |
|---|---|---|
| Admin | Add verified demo email | Share securely |
| Technician | Add verified demo email | Share securely |
| Customer | Add verified demo email | Share securely |

Do not publish production passwords, API keys, database credentials, or payment secrets in this repository.

## Project Status

The FixMate frontend is deployed and available for demonstration.

- Live application: https://fixmate-client-mu.vercel.app
- Backend API: https://fixmate-server-fqv6.onrender.com
- Source code: https://github.com/Sajid498/fixmate-client

