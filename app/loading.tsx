import { useRouter } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePrendIA } from "./_layout";

const LOADING_MESSAGES = [
  "Analizando la prenda...",
  "Leyendo etiqueta...",
  "Identificando características...",
  "Buscando prendas similares...",
  "Comparando precios...",
  "Calculando distancia...",
];

export default function LoadingScreen() {
  const router = useRouter();
  const { productPhoto, analysisStatus, analysisErrorMessage, runAnalysis } = usePrendIA();
  const [messageIndex, setMessageIndex] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!productPhoto) {
      router.replace("/");
      return;
    }

    if (hasStarted.current) {
      return;
    }
    hasStarted.current = true;
    runAnalysis();
    // Only ever auto-starts once per visit to this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((previous) => (previous + 1) % LOADING_MESSAGES.length);
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (analysisStatus === "done") {
      router.replace("/results");
    }
  }, [analysisStatus, router]);

  function handleRetry() {
    hasStarted.current = true;
    runAnalysis();
  }

  if (analysisStatus === "error") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-8">
        <CircleAlert size={40} color="#dc2626" />
        <Text className="mt-4 text-center text-base font-semibold text-neutral-900">
          No pudimos analizar la imagen.
        </Text>
        <Text className="mt-1 text-center text-sm text-neutral-500">
          Probá con una foto más clara.
        </Text>
        {analysisErrorMessage ? (
          <Text className="mt-2 text-center text-xs text-neutral-400">
            {analysisErrorMessage}
          </Text>
        ) : null}

        <View className="mt-8 w-full gap-3">
          <Pressable
            onPress={handleRetry}
            className="items-center rounded-2xl bg-neutral-900 py-4"
          >
            <Text className="text-base font-semibold text-white">Reintentar</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/")}
            className="items-center rounded-2xl bg-neutral-100 py-4"
          >
            <Text className="text-base font-semibold text-neutral-700">Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white px-8">
      <ActivityIndicator size="large" color="#18181b" />
      <Text className="mt-6 text-center text-base font-medium text-neutral-700">
        {LOADING_MESSAGES[messageIndex]}
      </Text>
    </SafeAreaView>
  );
}
