export type RootStackParamList = {
  Home: undefined;
  Login: { mode?: string };
  Explore: undefined;
  Search: undefined;
  Profil: undefined;
  Creations: undefined;
  AddCreation: undefined;
  EditCreation: { creation: import("../types/Creation").Creation };
  CreationDetail: { creationId: string };
  CreatorProfile: { artisanId: string }; // Added
  Favorites: undefined;
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
