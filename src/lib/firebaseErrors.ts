export function getFirebaseErrorMessage(error: unknown): string {
  const context =
    typeof error === 'object' && error !== null && 'path' in error && typeof error.path === 'string'
      ? error.path
      : null;
  const operation =
    typeof error === 'object' && error !== null && 'operation' in error && typeof error.operation === 'string'
      ? error.operation
      : null;
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for help.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a while and try again.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is not enabled for this Firebase project.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Check your connection and try again.';
    case 'permission-denied':
    case 'firestore/permission-denied':
      return context
        ? `Firestore denied ${operation ?? 'access'} to "${context}". Verify the signed-in user's UID and the rule for this exact path.`
        : `Firestore denied access. Verify the signed-in user's UID and the applicable security rule.`;
    case 'app/auth-uid-mismatch':
      return context
        ? `The current Firebase Auth user does not match the UID for "${context}". Sign out and back in, then retry.`
        : 'The current Firebase Auth user does not match the requested data owner.';
    case 'unavailable':
    case 'firestore/unavailable':
      return 'Firestore is temporarily unavailable. Please try again.';
    default:
      if (error instanceof Error && 'originalError' in error && error.originalError instanceof Error) {
        return `${error.message}: ${error.originalError.message}`;
      }
      return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  }
}
