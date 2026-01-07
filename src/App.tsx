import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import AetherInterface from '@/pages/AetherInterface';
import { HomePage } from '@/pages/HomePage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/aether",
    element: <AetherInterface />,
    errorElement: <RouteErrorBoundary />,
  },
]);
export default function App() {
  return <RouterProvider router={router} />;
}