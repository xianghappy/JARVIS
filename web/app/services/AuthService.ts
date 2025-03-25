export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export class AuthService {
  getUser() {
    const user = window.localStorage.getItem("JARVIS_USER");
    if (!user) {
      return null;
    }

    return JSON.parse(user) as AuthUser;
  }

  async signIn() {
    const user = this.getUser();
    if (user) {
      return;
    }

    if (location.pathname !== "/auth/signIn") {
      location.href = "auth/signIn";
    }
  }

  async signOut() {
    window.localStorage.removeItem("JARVIS_USER");

    location.href = "/";
  }
}
