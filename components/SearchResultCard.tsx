import { MapPin, Target } from "lucide-react-native";
import React from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

import { SearchResult } from "../types";

type SearchResultCardProps = {
  result: SearchResult;
};

function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-UY")}`;
}

function SavingsLabel({ savings }: { savings: number | null | undefined }) {
  if (savings === null || savings === undefined || savings === 0) {
    return null;
  }

  if (savings > 0) {
    return (
      <Text className="text-sm font-semibold text-emerald-600">
        💰 Ahorrás {formatPrice(savings)}
      </Text>
    );
  }

  return (
    <Text className="text-sm font-medium text-neutral-500">
      {formatPrice(Math.abs(savings))} más caro
    </Text>
  );
}

/**
 * "Ver ubicación" is a placeholder for this iteration — no real map yet,
 * see section 19 of the spec. It's wired up so a future map screen can
 * just replace this handler.
 */
function handleViewLocation(result: SearchResult) {
  Alert.alert(result.storeName, `${result.address}\n\nEl mapa llega en una próxima iteración.`);
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const similarityPercent = Math.round(result.similarityScore * 100);

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <Image source={{ uri: result.imageUri }} className="h-44 w-full" resizeMode="cover" />

      <View className="p-4">
        <Text className="text-base font-bold text-neutral-900">{result.title}</Text>
        <Text className="mt-0.5 text-xl font-extrabold text-neutral-900">
          {formatPrice(result.price)}
        </Text>

        <View className="mt-2 flex-row items-center gap-1">
          <Target size={14} color="#737373" />
          <Text className="text-sm font-medium text-neutral-500">
            {similarityPercent}% similar
          </Text>
        </View>

        <Text className="mt-2 text-sm text-neutral-700">{result.storeName}</Text>

        <Pressable
          onPress={() => handleViewLocation(result)}
          className="mt-1 flex-row items-center gap-1 self-start"
        >
          <MapPin size={14} color="#737373" />
          <Text className="text-sm text-neutral-500">{result.distanceKm} km · Ver ubicación</Text>
        </Pressable>

        <View className="mt-2">
          <SavingsLabel savings={result.savings} />
        </View>

        {result.sizeAvailable.length > 0 ? (
          <Text className="mt-2 text-xs text-neutral-400">
            Talles disponibles: {result.sizeAvailable.join(", ")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
