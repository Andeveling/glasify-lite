/**
 * Legacy Route Redirect (T037)
 *
 * Redirects /quotes → /admin/quotes
 * Preserves search params for backward compatibility
 *
 * Related: specs/001-admin-quotes-dashboard/spec.md
 */

import { redirect } from "next/navigation";

type QuotesPageProps = {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function QuotesRedirectPage({
  searchParams,
}: QuotesPageProps) {
  const params = await searchParams;

  // Build query string if params exist
  const queryParams = new URLSearchParams();
  if (params?.page) {
    queryParams.set("page", params.page);
  }
  if (params?.search) {
    queryParams.set("search", params.search);
  }
  if (params?.status) {
    queryParams.set("status", params.status);
  }

  const queryString = queryParams.toString();
  const redirectUrl = queryString
    ? `/admin/quotes?${queryString}`
    : "/admin/quotes";

  redirect(redirectUrl);
}
