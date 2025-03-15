import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "JARVIS" },
    { name: "description", content: "Welcome to AI!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen p-4">
      <div className="flex w-[260px]">sidebar</div>

      <div className="flex-1 flex bg-white rounded-lg">main</div>
    </div>
  );
}
