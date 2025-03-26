import { Outlet } from "@remix-run/react";
import Sidenav from "~/components/layout/Sidenav";

export default function Chat() {
  return (
    <div className="flex gap-4 h-screen p-4">
      <Sidenav />

      <Outlet />
    </div>
  );
}
