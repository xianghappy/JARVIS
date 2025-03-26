import type { MetaFunction } from "@remix-run/node";
import { Navigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "JARVIS" },
    { name: "description", content: "Welcome to AI!" },
  ];
};

export default function Index() {
  return <Navigate to="/chat" />;
}
