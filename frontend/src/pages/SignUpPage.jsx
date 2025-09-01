import { SignUp } from '@clerk/clerk-react';

function SignUpPage() {
  return (
    <div className="auth-page">
      <SignUp
        redirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  );
}

export default SignUpPage;
