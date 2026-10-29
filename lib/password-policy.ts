/**
 * Browser-side password guidance only. Supabase Auth is the password authority.
 * Never write, log, hash, cache or transmit passwords to an application table
 * or custom API; use the encrypted Supabase Auth client methods directly.
 */
export const MIN_PASSWORD_CHARACTERS=12;
export const MAX_PASSWORD_BYTES=72; // avoids silent bcrypt byte truncation
export function passwordProblem(value:string):string|null{
 if(value.length<MIN_PASSWORD_CHARACTERS)
  return "Use a password or passphrase with at least 12 characters.";
 if(new TextEncoder().encode(value).length>MAX_PASSWORD_BYTES)
  return "The password is too long in bytes. Use a shorter passphrase (maximum 72 bytes).";
 if(value.includes("\u0000"))
  return "The password contains an unsupported character.";
 return null;
}
export function passwordConfirmationProblem(password:string,confirmation:string):string|null{
 return passwordProblem(password)||
  (password!==confirmation?"The password confirmation does not match.":null);
}
