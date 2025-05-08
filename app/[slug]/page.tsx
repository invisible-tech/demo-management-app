import { notFound } from 'next/navigation';

// This page acts as a fallback for slug routes that weren't handled by middleware
// It should never actually be rendered if the middleware is working properly
export default function DemoSlugPage() {
  // If this component is rendered, it means the slug doesn't match any demo
  // or there was an error in the middleware, so we show a 404 page
  notFound();
} 