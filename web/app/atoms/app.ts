import { atom } from "jotai";
import { AuthService } from "~/services/authService";

export const authServiceAtom = atom<AuthService>(new AuthService());
