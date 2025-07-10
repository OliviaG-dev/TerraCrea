import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MyButton from "../components/MyButton";

const HomeScreen: React.FC = () => {
  const handlePress = () => {
    console.log("Bouton pressé !");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur TerraCréa !</Text>
      <Text style={styles.subtitle}>Ton app React Native avec TypeScript</Text>

      <View style={styles.buttonContainer}>
        <MyButton title="Clique-moi !" onPress={handlePress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default HomeScreen;
