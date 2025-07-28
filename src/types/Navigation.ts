export type RootStackParamList = {
  Home: undefined;
  Login: { mode?: string };
  Explore: undefined;
  Profil: undefined;
  EmailConfirmation: { email: string };
  EmailConfirmed: undefined;
};

// Type utilitaire pour la navigation
export type ScreenNavigationProp<T extends keyof RootStackParamList> =
  import("@react-navigation/native-stack").NativeStackNavigationProp<
    RootStackParamList,
    T
  >;
