import { Button, Title } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
export default function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen">
      <Title order={1}>Welcome, I'm JARVIS</Title>

      <Button
        className="p-2 rounded-md"
        color="dark"
        leftSection={<IconBrandGithub />}
        onClick={() => {
          window.location.href = import.meta.env.VITE_GITHUB_AUTH_URL;
        }}
      >
        使用 GitHub 登录
      </Button>
    </div>
  );
}
