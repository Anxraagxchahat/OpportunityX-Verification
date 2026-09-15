/**
 * Global Maintenance Mode Configuration
 * OpportunityX Certificate Verification
 *
 * When MAINTENANCE_MODE is set to true:
 * - The entire application renders the Server Under Maintenance page.
 * - All verification lookups, routes, and admin portals are protected.
 * - Normal application initialization and backend API requests are halted.
 *
 * To restore normal operation, simply change this to false:
 * export const MAINTENANCE_MODE = false;
 */
export const MAINTENANCE_MODE = false;
