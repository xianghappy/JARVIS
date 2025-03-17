import { Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import ky from "ky";
import ChatInput from "~/components/ChatInput";

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

      <div className="flex-1 flex flex-col gap-2 p-4 bg-white rounded-lg">
        <Text className="flex-1">Jarvis</Text>
        <ChatInput
          onSend={async () => {
            console.log(
              await ky
                .post("http://localhost:8000/chat", {
                  json: {},
                })
                .json()
            );
          }}
        />
      </div>
    </div>
  );
}
