import { Avatar } from "@mantine/core";
import { memo } from "react";

export interface ChatUserGroupProps {
  className?: string;
}

export default memo(function ChatUserGroup(props: ChatUserGroupProps) {
  const { className } = props;

  return (
    <Avatar.Group className={className}>
      <Avatar color="cyan" radius="xl">
        A
      </Avatar>
      <Avatar color="cyan" radius="xl">
        B
      </Avatar>
      <Avatar color="cyan" radius="xl">
        C
      </Avatar>
      <Avatar>+5</Avatar>
    </Avatar.Group>
  );
});
