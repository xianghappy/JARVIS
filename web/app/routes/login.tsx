import { Button, Container, Title, Text, Paper, Center } from "@mantine/core";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // 检查 URL 中是否有 token
        const token = searchParams.get("token");
        if (token) {
            // 保存 token
            localStorage.setItem("jwt_token", token);
            // 跳转到 chat 页面
            navigate("/chat");
            return;
        }

        // 检查是否已经有 token
        const savedToken = localStorage.getItem("jwt_token");
        if (savedToken) {
            navigate("/chat");
        }
    }, [navigate, searchParams]);

    function handleGithubLogin() {
        const clientId = 'Ov23litfrAG0QpK3y63c';
        const redirectUri = 'http://localhost:8000/loginCallBack';
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user`;
        window.location.href = githubAuthUrl;
    }

    return (
        <Container size="xs" style={{ height: "100vh", display: "flex", alignItems: "center" }}>
            <Paper shadow="md" p="xl" style={{ width: "100%" }}>
                <Center>
                    <Title order={2} mb="md">欢迎使用 JARVIS</Title>
                </Center>
                <Text ta="center" mb="xl">
                    请使用 GitHub 账号登录
                </Text>
                <Center>
                    <Button 
                        onClick={handleGithubLogin}
                        size="lg"
                        variant="filled"
                        color="dark"
                        leftSection={
                            <svg
                                height="24"
                                viewBox="0 0 16 16"
                                width="24"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                                />
                            </svg>
                        }
                    >
                        使用 GitHub 登录
                    </Button>
                </Center>
            </Paper>
        </Container>
    );
} 