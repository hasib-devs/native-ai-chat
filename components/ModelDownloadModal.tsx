import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";
import { OfflineSTTService, WhisperModel } from "../services/OfflineSTTService";

interface ModelDownloadModalProps {
  visible: boolean;
  onClose: () => void;
  onModelUpdate: () => void;
}

export const ModelDownloadModal: React.FC<ModelDownloadModalProps> = ({
  visible,
  onClose,
  onModelUpdate,
}) => {
  const [models, setModels] = useState<WhisperModel[]>([]);
  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    availableSpace: 0,
    modelsSize: 0,
  });
  const [downloadProgress, setDownloadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );
  const backgroundColor = useThemeColor(
    { light: "#FFFFFF", dark: "#1C1C1E" },
    "background"
  );
  const cardColor = useThemeColor(
    { light: "#F2F2F7", dark: "#2C2C2E" },
    "background"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#FFFFFF" },
    "text"
  );

  const offlineService = OfflineSTTService.getInstance();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [availableModels, storage] = await Promise.all([
        offlineService.getAvailableModels(),
        offlineService.getStorageInfo(),
      ]);

      setModels(availableModels);
      setStorageInfo(storage);
    } catch (error) {
      console.error("Failed to load model data:", error);
      Alert.alert("Error", "Failed to load model information");
    } finally {
      setIsLoading(false);
    }
  }, [offlineService]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  const handleDownload = async (modelName: string) => {
    try {
      setDownloadProgress((prev) => ({ ...prev, [modelName]: 0 }));

      await offlineService.downloadModel(modelName, (progress) => {
        setDownloadProgress((prev) => ({ ...prev, [modelName]: progress }));
      });

      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[modelName];
        return newProgress;
      });

      await loadData();
      onModelUpdate();

      Alert.alert("Success", `${modelName} downloaded successfully!`);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[modelName];
        return newProgress;
      });

      Alert.alert(
        "Download Failed",
        `Failed to download ${modelName}. Please try again.`
      );
    }
  };

  const handleDelete = async (modelName: string) => {
    Alert.alert(
      "Delete Model",
      `Are you sure you want to delete ${modelName}? This will free up storage space but you'll need to download it again to use offline features.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await offlineService.deleteModel(modelName);
              await loadData();
              onModelUpdate();
              Alert.alert("Success", `${modelName} deleted successfully`);
            } catch (error) {
              console.error("Delete failed:", error);
              Alert.alert("Error", `Failed to delete ${modelName}`);
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSpaceAvailable = (): boolean => {
    // Check if we have enough space for the largest model (assuming 500MB max)
    return storageInfo.availableSpace > 500 * 1024 * 1024;
  };

  const renderModelItem = (model: WhisperModel) => {
    const isDownloading = downloadProgress[model.name] !== undefined;
    const progress = downloadProgress[model.name] || 0;

    return (
      <View
        key={model.name}
        style={[styles.modelCard, { backgroundColor: cardColor }]}
      >
        <View style={styles.modelHeader}>
          <View style={styles.modelInfo}>
            <Text style={[styles.modelName, { color: textColor }]}>
              {model.name}
            </Text>
            <Text style={[styles.modelDetails, { color: "#8E8E93" }]}>
              {model.size} • {model.language}
            </Text>
          </View>

          <View style={styles.modelStatus}>
            {model.isDownloaded && (
              <View
                style={[styles.statusBadge, { backgroundColor: "#34C759" }]}
              >
                <Text style={styles.statusText}>Downloaded</Text>
              </View>
            )}
          </View>
        </View>

        {/* Download Progress */}
        {isDownloading && (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: textColor }]}>
              Downloading... {Math.round(progress)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: primaryColor,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.modelActions}>
          {model.isDownloaded ? (
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: "#FF3B30" }]}
              onPress={() => handleDelete(model.name)}
              disabled={isDownloading}
            >
              <Text style={[styles.deleteButtonText, { color: "#FF3B30" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.downloadButton,
                { backgroundColor: primaryColor },
                (!getSpaceAvailable() || isDownloading) &&
                  styles.disabledButton,
              ]}
              onPress={() => handleDownload(model.name)}
              disabled={!getSpaceAvailable() || isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.downloadButtonText}>Download</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Model Description */}
        <Text style={[styles.modelDescription, { color: "#8E8E93" }]}>
          {model.name.includes("Tiny") &&
            "Fastest processing, good for quick transcriptions"}
          {model.name.includes("Base") &&
            model.language === "english" &&
            "Optimized for English, balanced speed and accuracy"}
          {model.name.includes("Base") &&
            model.language === "multilingual" &&
            "Good balance of speed and accuracy for multiple languages"}
          {model.name.includes("Small") && "Higher accuracy, slower processing"}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: primaryColor }]}>
              Done
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>
            Offline Models
          </Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={[styles.refreshButton, { color: primaryColor }]}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>
              Loading models...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Storage Info */}
            <View style={[styles.storageCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.storageTitle, { color: textColor }]}>
                Storage Information
              </Text>
              <View style={styles.storageRow}>
                <Text style={[styles.storageLabel, { color: "#8E8E93" }]}>
                  Used by models:
                </Text>
                <Text style={[styles.storageValue, { color: textColor }]}>
                  {formatBytes(storageInfo.modelsSize)}
                </Text>
              </View>
              <View style={styles.storageRow}>
                <Text style={[styles.storageLabel, { color: "#8E8E93" }]}>
                  Available space:
                </Text>
                <Text style={[styles.storageValue, { color: textColor }]}>
                  {formatBytes(storageInfo.availableSpace)}
                </Text>
              </View>
              {!getSpaceAvailable() && (
                <Text style={[styles.storageWarning, { color: "#FF3B30" }]}>
                  ⚠️ Low storage space. Consider freeing up space before
                  downloading.
                </Text>
              )}
            </View>

            {/* Models List */}
            <View style={styles.modelsSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Available Models
              </Text>
              <Text style={[styles.sectionDescription, { color: "#8E8E93" }]}>
                Download models for offline speech recognition. Larger models
                provide better accuracy but require more storage and processing
                time.
              </Text>

              {models.map(renderModelItem)}
            </View>

            {/* Information Section */}
            <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.infoTitle, { color: textColor }]}>
                About Offline Models
              </Text>
              <Text style={[styles.infoText, { color: "#8E8E93" }]}>
                • Offline models enable speech recognition without internet
                connection{"\n"}• Larger models provide better accuracy but are
                slower{"\n"}• English-specific models work better for
                English-only content{"\n"}• Models are stored locally and only
                downloaded once
              </Text>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  closeButton: {
    fontSize: 17,
    fontWeight: "400",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  refreshButton: {
    fontSize: 17,
    fontWeight: "400",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  storageCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  storageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  storageLabel: {
    fontSize: 14,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  storageWarning: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  modelsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modelCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  modelDetails: {
    fontSize: 14,
  },
  modelStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  modelActions: {
    marginBottom: 8,
  },
  downloadButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  modelDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
