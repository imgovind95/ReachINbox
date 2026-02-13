import { redirect } from 'next/navigation';

/**
 * Root dashboard page.
 * Automatically redirects to the 'Scheduled' view as the default entry point.
 */
export default function DashboardPage() {
  // Enforce redirection to the default view
  redirect('/dashboard/scheduled');

  return null; // Should not be reached
}
