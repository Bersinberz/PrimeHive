/**
 * Generates a simple SVG data URI avatar from initials.
 * Avoids external service calls (privacy + CSP).
 */
export const getInitialsAvatar = (name: string, bg = "#ff8c42", color = "#fff"): string => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect width="40" height="40" rx="20" fill="${bg}"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="${color}">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
