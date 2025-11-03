import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  progressButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  historyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  newChatText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
  inputToolbarContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputToolbar: {
    flex: 1,
    marginRight: 10,
    borderTopWidth: 1,
    borderRadius: 25,
    paddingTop: 8,
  },
  micButtonContainer: {
    marginBottom: 8,
  },
  sendButton: {
    marginBottom: 8,
    marginRight: 8,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    opacity: 0.8,
  },
  offlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  strategyText: {
    fontSize: 10,
    opacity: 0.6,
    flex: 1,
    textAlign: "right",
  },
});
