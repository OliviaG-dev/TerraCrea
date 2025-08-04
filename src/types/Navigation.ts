export type RootStackParamList = {
  Home: undefined;
  Login: { mode?: string };
  Explore: undefined;
  Profil: undefined;
  Creations: undefined;
  AddCreation: undefined;
  EmailConfirmation: { email: string };
  EmailConfirmed: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

// Type utilitaire pour la navigation
export type ScreenNavigationProp<T extends keyof RootStackParamList> =
  import("@react-navigation/native-stack").NativeStackNavigationProp<
    RootStackParamList,
    T
  >;
