# 💰 Expense Tracker

A comprehensive monthly expense tracking application built with Next.js, Tailwind CSS, and Clerk authentication.

## ✨ Features

- **Monthly Expense Planning**: Track expenses by due dates
- **EMI Management**: Automatic calculation of remaining installments
- **Multi-source Income Tracking**: Manage income from various sources
- **Credit Card Management**: Track limits, usage, and available amounts
- **Transfer Tracking**: Monitor money transfers between sources
- **PDF Export**: Generate statements for any date range
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Authentication**: Powered by Clerk

## 🎨 Design

The application uses a custom color palette:
- **Walden Pond** (`#759ab7`): Primary buttons and accents
- **Burnt Sienna** (`#ce6e55`): Secondary actions and expenses
- **Squid Ink** (`#04132a`): Text and dark elements

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Sign up at [Clerk](https://clerk.com/) and create a new application
   - Copy your Clerk keys to `.env.local`:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Adding Expenses
1. Click "Add Expense" button
2. Fill in the expense details
3. Set the due date (day of month)
4. Choose category: Regular Expense, EMI, or Transfer

### Managing EMIs
- EMIs automatically calculate remaining installments
- View progress bars for each EMI
- Track next payment dates

### Income Sources
- Add multiple income sources
- Set recurring vs one-time income
- Specify frequency (monthly, weekly, yearly)

### Credit Cards
- Add multiple credit cards
- Track utilization percentages
- Set payment due dates
- Monitor available credit

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Clerk
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Date Handling**: date-fns

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Clerk provider
│   ├── page.tsx           # Main page with authentication
│   └── globals.css        # Global styles and custom classes
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard component
│   ├── ExpenseForm.tsx    # Add/edit expense modal
│   ├── ExpenseList.tsx    # Expense table display
│   ├── EMIList.tsx        # EMI table with progress
│   ├── IncomeForm.tsx     # Add/edit income modal
│   └── CreditCardManager.tsx # Credit card management
├── lib/                   # Utility functions
│   ├── utils.ts          # General utilities
│   └── emi-utils.ts      # EMI calculation functions
└── types/                 # TypeScript type definitions
    └── index.ts          # All application types
```

## 💾 Data Storage

Currently uses localStorage for data persistence. For production, consider integrating with:
- Supabase
- MongoDB
- PostgreSQL
- Firebase

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🔐 Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Create a new issue if needed
3. Include steps to reproduce any bugs

---

**Happy expense tracking! 💰📊**
