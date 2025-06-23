import Link from 'next/link';

import SignIn  from '../_components/login-form';

export default function LoginPage() {
  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          Or{' '}
          <Link
            className="text-primary font-medium hover:underline"
            href="/sign-up"
          >
            create a new account
          </Link>
        </p>
      </div>
      <SignIn />
    </>
  );
}
