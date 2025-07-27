import { supabase } from "./supabase";

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export class AuthService {
  // Inscription avec confirmation email
  static async signUpWithEmailConfirmation(signUpData: SignUpData) {
    const { email, password, firstName, lastName, username } = signUpData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          process.env.EXPO_PUBLIC_APP_URL || "http://localhost:8081"
        }/email-confirmed`,
        data: {
          username: username || email.split("@")[0],
          firstName: firstName || "",
          lastName: lastName || "",
          isBuyer: true,
          isArtisan: false,
        },
      },
    });

    return {
      data,
      error,
      needsConfirmation: !error && !data.user?.email_confirmed_at,
    };
  }

  // Renvoyer l'email de confirmation
  static async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    return { error };
  }

  // Vérifier le statut de confirmation
  static async checkEmailConfirmed() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email_confirmed_at ? true : false;
  }

  // Connexion avec vérification de confirmation
  static async signInWithEmailPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user && !data.user.email_confirmed_at) {
      return {
        data,
        error: null,
        needsConfirmation: true,
      };
    }

    return { data, error, needsConfirmation: false };
  }
}
