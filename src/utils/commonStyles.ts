import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

// Styles communs pour les headers
export const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: "100%",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f4",
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 40,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    fontFamily: "System",
    letterSpacing: 0.3,
    flex: 1,
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  favoritesButton: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: 65,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  favoritesButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
    letterSpacing: 0.2,
  },
});

// Styles communs pour les inputs
export const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
    fontFamily: "System",
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    fontFamily: "System",
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: "#fef2f2",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "right",
    marginTop: 4,
    fontFamily: "System",
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    fontFamily: "System",
  },
});

// Styles communs pour les boutons
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  danger: {
    backgroundColor: COLORS.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    backgroundColor: COLORS.darkGray,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
  secondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
  dangerText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
  disabledText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
});

// Styles communs pour les cartes
export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fefefe",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
    fontFamily: "System",
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: "System",
  },
});

// Styles communs pour les états vides
export const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
    fontFamily: "System",
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: "System",
  },
});

// Styles communs pour les états de chargement
export const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  text: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: "System",
  },
});

// Styles communs pour les modales
export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "System",
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: "System",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
