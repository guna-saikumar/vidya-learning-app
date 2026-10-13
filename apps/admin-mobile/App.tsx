import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import Colors from "../../packages/design-tokens/src/colors";
import { PlaceholderBox } from "../../packages/ui/src";

export default function AdminApp() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Vidya Admin Mobile</Text>
        <Text style={styles.subtitle}>
          Minimal admin dashboard placeholder. Use the web admin app for heavy content
          editing; this app can be extended for on-the-go approvals and quick stats.
        </Text>
        <PlaceholderBox />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary
  }
});
