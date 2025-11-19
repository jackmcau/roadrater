export function validateUsername(username) {
  if (typeof username !== 'string') return 'Username is required';
  const trimmed = username.trim();
  if (trimmed.length < 8) return 'Username must be at least 8 characters long';
  if (!/^[A-Za-z0-9]+$/.test(trimmed)) return 'Username may only contain letters and numbers';
  return null;
}

export function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}
