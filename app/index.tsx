import { useRouter } from "expo-router";
import { Sparkles, Tag } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CameraCapture, CapturedPhoto } from "../components/CameraCapture";
import { usePrendIA } from "./_layout";

export default function HomeScreen() {
  const router = useRouter();
  const { productPhoto, labelPhoto, setProductPhoto, setLabelPhoto } = usePrendIA();

  function handleProductCapture(photo: CapturedPhoto) {
    setProductPhoto(photo);
  }

  function handleLabelCapture(photo: CapturedPhoto) {
    setLabelPhoto(photo);
  }

  function handleAnalyze() {
    if (!productPhoto) {
      return;
    }
    router.push("/loading");
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="mb-8 flex-row items-center gap-2">
          <Sparkles size={24} color="#18181b" />
          <Text className="text-2xl font-bold text-neutral-900">PrendIA</Text>
        </View>

        <Text className="mb-1 text-lg font-semibold text-neutral-900">
          Sacale una foto a una prenda
        </Text>
        <Text className="mb-6 text-sm text-neutral-500">
          Encontrá la misma o una parecida, más barata y/o más cerca.
        </Text>

        <View className="gap-4">
          <CameraCapture
            label="Foto de la prenda"
            placeholder="📸 Foto de prenda"
            imageUri={productPhoto?.uri}
            onCapture={handleProductCapture}
            onRemove={() => setProductPhoto(null)}
          />

          <View>
            <CameraCapture
              label="Foto de la etiqueta"
              placeholder="🏷️ Agregar foto de etiqueta (opcional)"
              imageUri={labelPhoto?.uri}
              onCapture={handleLabelCapture}
              onRemove={() => setLabelPhoto(null)}
            />
            {!labelPhoto ? (
              <View className="mt-2 flex-row items-center gap-1.5">
                <Tag size={14} color="#a3a3a3" />
                <Text className="text-xs text-neutral-400">
                  Si incluís la etiqueta, podemos leer marca, talle y precio.
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={handleAnalyze}
          disabled={!productPhoto}
          className={`mt-8 items-center rounded-2xl py-4 ${
            productPhoto ? "bg-neutral-900" : "bg-neutral-200"
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              productPhoto ? "text-white" : "text-neutral-400"
            }`}
          >
            Analizar prenda
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
