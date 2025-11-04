import { StyleSheet, Text, View } from "react-native";

export const MicButton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Text style={styles.buttonIcon}>🎤</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },

  buttonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a7ea4",
  },
  buttonIcon: {
    fontSize: 25,
  },
});
