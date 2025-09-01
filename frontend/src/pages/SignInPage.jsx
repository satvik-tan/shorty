import { SignIn } from '@clerk/clerk-react';

function SignInPage() {
  return (
    <div className="auth-page">
      <SignIn
        redirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}

export default SignInPage;
