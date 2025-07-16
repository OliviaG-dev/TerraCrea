import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";

const { width } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const handleGetStarted = () => {
    console.log("Get Started pressed!");
    // Ici vous pouvez ajouter la navigation vers l'écran suivant
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.mainTitle}>La création prend{"\n"}racine ici</Text>

        <Text style={styles.subtitle}>
          Achetez des bijoux, poterie,{"\n"}décorations et plus encore fabriqués
          localement.
        </Text>

        <View style={styles.productsContainer}>
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

          <View style={styles.productCard}>
            <View style={styles.productImage2}>
              <View style={styles.ceramicVase} />
              <View style={styles.frameDecor} />
            </View>
          </View>

          <View style={styles.productCard}>
            <View style={styles.productImage3}>
              <View style={styles.basketContainer}>
                <View style={styles.basket} />
                <View style={styles.utensils} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Footer Section */}
      <View style={styles.footerSection}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>Visitez</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  headerSection: {
    flex: 0.26,
    justifyContent: "center",
    alignItems: "center",
  },
  contentSection: {
    flex: 0.6,
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  footerSection: {
    flex: 0.14,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 340,
    height: 110,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: "#4a5c4a",
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: 1.2,
    paddingHorizontal: 30,
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "300",
    color: "#7a8a7a",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.3,
    paddingHorizontal: 40,
    fontFamily: "System",
  },
  productsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  productCard: {
    width: (width - 120) / 3,
    height: 60,
    marginHorizontal: 8,
  },
  productImage1: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  productImage2: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  productImage3: {
    flex: 1,
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
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
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a0a0a0",
    width: 200,
    alignSelf: "center",
  },
  getStartedText: {
    color: "#6a6a6a",
    fontSize: 14,
    fontWeight: "300",
    textAlign: "center",
    letterSpacing: 0.8,
    fontFamily: "System",
  },
});

export default HomeScreen;
