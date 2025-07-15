import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const handleGetStarted = () => {
    console.log("Get Started pressed!");
    // Ici vous pouvez ajouter la navigation vers l'écran suivant
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Logo TerraCrea */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>TerraCrea</Text>
        <View style={styles.logoIcon}>
          <Text style={styles.leafIcon}>🌿</Text>
        </View>
      </View>

      {/* Main Title */}
      <Text style={styles.mainTitle}>
        Discover Unique{"\n"}Handmade Creations
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Shop locally crafted jewelry,{"\n"}ceramics, decor, and more.
      </Text>

      {/* Product Images Grid */}
      <View style={styles.productsContainer}>
        {/* Product 1 - Jewelry */}
        <View style={styles.productCard}>
          <View style={styles.productImage1}>
            <View style={styles.jewelryDisplay}>
              <View style={styles.earringSet}>
                <View style={[styles.earring, styles.earringGold]} />
                <View style={[styles.earring, styles.earringPink]} />
                <View style={[styles.earring, styles.earringGold]} />
              </View>
            </View>
          </View>
        </View>

        {/* Product 2 - Ceramics */}
        <View style={styles.productCard}>
          <View style={styles.productImage2}>
            <View style={styles.ceramicVase} />
            <View style={styles.frameDecor} />
          </View>
        </View>

        {/* Product 3 - Basket */}
        <View style={styles.productCard}>
          <View style={styles.productImage3}>
            <View style={styles.basketContainer}>
              <View style={styles.basket} />
              <View style={styles.utensils} />
            </View>
          </View>
        </View>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={handleGetStarted}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f6f3",
  },
  contentContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 60,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "300",
    color: "#7a8471",
    fontStyle: "italic",
  },
  logoIcon: {
    marginLeft: 8,
  },
  leafIcon: {
    fontSize: 24,
    color: "#7a8471",
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#2d4a3a",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7c6b",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 26,
  },
  productsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
    paddingHorizontal: 10,
  },
  productCard: {
    width: (width - 80) / 3,
    height: 120,
    marginHorizontal: 5,
  },
  productImage1: {
    flex: 1,
    backgroundColor: "#f0ece3",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage2: {
    flex: 1,
    backgroundColor: "#ebe7dc",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage3: {
    flex: 1,
    backgroundColor: "#ede9de",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jewelryDisplay: {
    width: 40,
    height: 40,
    backgroundColor: "#d4a574",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  earringSet: {
    flexDirection: "row",
    gap: 3,
  },
  earring: {
    width: 8,
    height: 12,
    borderRadius: 4,
  },
  earringGold: {
    backgroundColor: "#c49969",
  },
  earringPink: {
    backgroundColor: "#d4a574",
  },
  ceramicVase: {
    width: 30,
    height: 40,
    backgroundColor: "#b8a892",
    borderRadius: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  frameDecor: {
    position: "absolute",
    top: 10,
    width: 25,
    height: 20,
    backgroundColor: "#ddd5c7",
    borderRadius: 2,
  },
  basketContainer: {
    alignItems: "center",
  },
  basket: {
    width: 35,
    height: 25,
    backgroundColor: "#c4a068",
    borderRadius: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  utensils: {
    marginTop: 5,
    width: 20,
    height: 2,
    backgroundColor: "#8b6f47",
    borderRadius: 1,
  },
  getStartedButton: {
    backgroundColor: "#2d4a3a",
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 50,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: width - 40,
    maxWidth: 300,
  },
  getStartedText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default HomeScreen;
