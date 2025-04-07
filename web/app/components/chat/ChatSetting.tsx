import { ActionIcon, Menu } from "@mantine/core";
import { IconHistory, IconSettings } from "@tabler/icons-react";
import { memo } from "react";

export default memo(function ChatSetting() {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="default">
          <IconSettings size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconHistory size={16} />}>History</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
});
