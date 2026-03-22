/**
 * Formats a phone number stored as "+91XXXXXXXXXX" to "+91 XXXXXXXXXX".
 * Handles already-spaced numbers gracefully.
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return phone;
  if (phone.startsWith('+91') && !phone.includes(' ')) {
    return `+91 ${phone.slice(3)}`;
  }
  return phone;
};
