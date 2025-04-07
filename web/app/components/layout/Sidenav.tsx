import { Avatar, Button, Text } from "@mantine/core";
import { memo } from "react";

export default memo(function Sidenav() {
  return (
    <div className="flex flex-col w-[260px]">
      <div className="flex items-center gap-2 h-[56px] px-2">
        <Avatar color="cyan" radius="xl">
          JV
        </Avatar>

        <Text>JARVIS</Text>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="mt-auto"></div>
        <Button>Sign In</Button>
      </div>
    </div>
  );
});
