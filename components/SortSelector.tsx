import React from "react";
import { Pressable, ScrollView, Text } from "react-native";

import { SortBy } from "../types";

type SortSelectorProps = {
  sortBy: SortBy;
  onChangeSortBy: (sortBy: SortBy) => void;
  sameBrandOnly: boolean;
  onToggleSameBrand: () => void;
  brandAvailable: boolean;
};

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: "price", label: "💰 Más barato" },
  { value: "distance", label: "📍 Más cerca" },
  { value: "similarity", label: "🎯 Más parecido" },
];

/**
 * "Misma marca" isn't a sort order (searchProducts only sorts by
 * price/distance/similarity) — it's an independent filter that can be
 * combined with whichever sort is currently active.
 */
export function SortSelector({
  sortBy,
  onChangeSortBy,
  sameBrandOnly,
  onToggleSameBrand,
  brandAvailable,
}: SortSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      {SORT_OPTIONS.map((option) => {
        const isActive = sortBy === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChangeSortBy(option.value)}
            className={`rounded-full px-4 py-2 ${isActive ? "bg-neutral-900" : "bg-neutral-100"}`}
          >
            <Text
              className={`text-sm font-medium ${isActive ? "text-white" : "text-neutral-600"}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={onToggleSameBrand}
        disabled={!brandAvailable}
        className={`rounded-full px-4 py-2 ${
          !brandAvailable ? "bg-neutral-50" : sameBrandOnly ? "bg-neutral-900" : "bg-neutral-100"
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            !brandAvailable
              ? "text-neutral-300"
              : sameBrandOnly
                ? "text-white"
                : "text-neutral-600"
          }`}
        >
          🏷️ Misma marca
        </Text>
      </Pressable>
    </ScrollView>
  );
}
