import { useRouter } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductSummary } from "../components/ProductSummary";
import { SearchResultCard } from "../components/SearchResultCard";
import { SortSelector } from "../components/SortSelector";
import { SearchResult } from "../types";
import { usePrendIA } from "./_layout";

function normalizeBrand(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

export default function ResultsScreen() {
  const router = useRouter();
  const { extractedProduct, searchResults, sortBy, changeSortBy, reset } = usePrendIA();
  const [sameBrandOnly, setSameBrandOnly] = useState(false);

  const brandAvailable = Boolean(extractedProduct?.brand);

  const displayedResults = useMemo<SearchResult[]>(() => {
    if (!sameBrandOnly || !extractedProduct?.brand) {
      return searchResults;
    }
    const targetBrand = normalizeBrand(extractedProduct.brand);
    return searchResults.filter((result) => normalizeBrand(result.brand) === targetBrand);
  }, [searchResults, sameBrandOnly, extractedProduct]);

  function handleStartOver() {
    reset();
    router.replace("/");
  }

  if (!extractedProduct) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-neutral-500">No hay un análisis en curso.</Text>
        <Pressable onPress={handleStartOver} className="mt-6 rounded-2xl bg-neutral-900 px-6 py-3">
          <Text className="font-semibold text-white">Volver al inicio</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Pressable onPress={handleStartOver} className="h-9 w-9 items-center justify-center">
          <ArrowLeft size={22} color="#18181b" />
        </Pressable>
        <Text className="text-base font-bold text-neutral-900">Resultados</Text>
        <View className="h-9 w-9" />
      </View>

      <FlatList
        data={displayedResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 8 }}
        ListHeaderComponent={
          <View className="mb-4">
            <ProductSummary extractedProduct={extractedProduct} />

            <Text className="my-4 text-base font-semibold text-neutral-900">
              {displayedResults.length > 0
                ? `Encontramos ${displayedResults.length} ${
                    displayedResults.length === 1 ? "opción" : "opciones"
                  }`
                : "No encontramos coincidencias"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center rounded-2xl bg-neutral-50 px-6 py-10">
            <Search size={32} color="#a3a3a3" />
            <Text className="mt-3 text-center text-sm font-medium text-neutral-600">
              No encontramos coincidencias.
            </Text>
            <Text className="mt-2 text-center text-sm text-neutral-400">
              Probá con:{"\n"}- otra foto{"\n"}- una foto de la etiqueta{"\n"}- una prenda más
              visible
            </Text>
          </View>
        }
        renderItem={({ item }) => <SearchResultCard result={item} />}
      />

      <View className="border-t border-neutral-100 pb-2 pt-3">
        <SortSelector
          sortBy={sortBy}
          onChangeSortBy={changeSortBy}
          sameBrandOnly={sameBrandOnly}
          onToggleSameBrand={() => setSameBrandOnly((prev) => !prev)}
          brandAvailable={brandAvailable}
        />
      </View>
    </SafeAreaView>
  );
}
