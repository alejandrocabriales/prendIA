import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Alert, Image, Modal, Pressable, Text, View } from "react-native";

export type CapturedPhoto = {
  uri: string;
  base64: string;
};

type CameraCaptureProps = {
  label: string;
  placeholder: string;
  imageUri?: string | null;
  onCapture: (photo: CapturedPhoto) => void;
  onRemove?: () => void;
};

/**
 * One "photo slot": shows a placeholder until a photo is taken, then shows
 * a thumbnail with a remove button. Tapping the placeholder opens a live
 * in-app camera (expo-camera). If camera permission is denied, it falls
 * back to the photo library (expo-image-picker) automatically — the user
 * is never fully blocked from completing the flow.
 */
export function CameraCapture({
  label,
  placeholder,
  imageUri,
  onCapture,
  onRemove,
}: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function pickFromLibrary() {
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!libraryPermission.granted) {
      Alert.alert(
        "Sin acceso a fotos",
        "PrendIA necesita acceso a tus fotos para elegir una imagen."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.6,
    });

    if (result.canceled || !result.assets[0]?.base64) {
      return;
    }

    onCapture({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
  }

  async function openCamera() {
    if (!permission?.granted) {
      const response = await requestPermission();

      if (!response.granted) {
        await pickFromLibrary();
        return;
      }
    }

    setIsCameraOpen(true);
  }

  async function takePicture() {
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.6,
      base64: true,
    });

    if (!photo?.base64) {
      return;
    }

    onCapture({ uri: photo.uri, base64: photo.base64 });
    setIsCameraOpen(false);
  }

  if (imageUri) {
    return (
      <View className="relative">
        <Image source={{ uri: imageUri }} className="h-40 w-full rounded-2xl" resizeMode="cover" />
        <Text className="mt-1 text-sm font-medium text-neutral-600">{label}</Text>
        {onRemove ? (
          <Pressable
            onPress={onRemove}
            className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/60"
          >
            <X size={16} color="white" />
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={openCamera}
        className="h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50"
      >
        <Camera size={28} color="#737373" />
        <Text className="mt-2 text-sm font-medium text-neutral-500">{placeholder}</Text>
      </Pressable>

      <Modal visible={isCameraOpen} animationType="slide">
        <View className="flex-1 bg-black">
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

          <View className="absolute inset-x-0 top-0 flex-row justify-end p-4 pt-14">
            <Pressable
              onPress={() => setIsCameraOpen(false)}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <X size={20} color="white" />
            </Pressable>
          </View>

          <View className="absolute inset-x-0 bottom-0 items-center gap-4 pb-10 pt-6">
            <Pressable
              onPress={takePicture}
              className="h-20 w-20 items-center justify-center rounded-full border-4 border-white"
            >
              <View className="h-16 w-16 rounded-full bg-white" />
            </Pressable>

            <Pressable
              onPress={() => {
                setIsCameraOpen(false);
                pickFromLibrary();
              }}
              className="flex-row items-center gap-2 rounded-full bg-black/50 px-4 py-2"
            >
              <ImageIcon size={16} color="white" />
              <Text className="text-sm font-medium text-white">Elegir de la galería</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
