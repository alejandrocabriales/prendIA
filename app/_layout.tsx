import "../global.css";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { mockProducts } from "../data/mockProducts";
import { analyzeProductImages } from "../services/aiVision";
import { DEFAULT_LOCATION, getUserLocation } from "../services/location";
import { searchProducts } from "../services/searchEngine";
import { Coordinates, ExtractedProduct, SearchResult, SortBy } from "../types";

export type CapturedPhoto = {
  uri: string;
  base64: string;
};

type AnalysisStatus = "idle" | "analyzing" | "error" | "done";

type PrendIAContextValue = {
  productPhoto: CapturedPhoto | null;
  labelPhoto: CapturedPhoto | null;
  setProductPhoto: (photo: CapturedPhoto | null) => void;
  setLabelPhoto: (photo: CapturedPhoto | null) => void;

  extractedProduct: ExtractedProduct | null;
  searchResults: SearchResult[];
  userLocation: Coordinates;
  sortBy: SortBy;

  analysisStatus: AnalysisStatus;
  analysisErrorMessage: string | null;

  runAnalysis: () => Promise<void>;
  changeSortBy: (sortBy: SortBy) => void;
  reset: () => void;
};

const PrendIAContext = createContext<PrendIAContextValue | null>(null);

export function usePrendIA(): PrendIAContextValue {
  const context = useContext(PrendIAContext);
  if (!context) {
    throw new Error("usePrendIA must be used within the PrendIA root layout.");
  }
  return context;
}

function PrendIAProvider({ children }: { children: React.ReactNode }) {
  const [productPhoto, setProductPhoto] = useState<CapturedPhoto | null>(null);
  const [labelPhoto, setLabelPhoto] = useState<CapturedPhoto | null>(null);

  const [extractedProduct, setExtractedProduct] = useState<ExtractedProduct | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_LOCATION);
  const [sortBy, setSortBy] = useState<SortBy>("similarity");

  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [analysisErrorMessage, setAnalysisErrorMessage] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!productPhoto) {
      return;
    }

    setAnalysisStatus("analyzing");
    setAnalysisErrorMessage(null);

    const [visionResult, location] = await Promise.all([
      analyzeProductImages({
        productImageBase64: productPhoto.base64,
        labelImageBase64: labelPhoto?.base64 ?? null,
      }),
      getUserLocation(),
    ]);

    setUserLocation(location);

    if (!visionResult.success) {
      setAnalysisStatus("error");
      setAnalysisErrorMessage(visionResult.error.message);
      return;
    }

    setExtractedProduct(visionResult.data);
    setSearchResults(
      searchProducts({
        extractedProduct: visionResult.data,
        products: mockProducts,
        userLocation: location,
        sortBy,
      })
    );
    setAnalysisStatus("done");
  }, [productPhoto, labelPhoto, sortBy]);

  const changeSortBy = useCallback(
    (nextSortBy: SortBy) => {
      setSortBy(nextSortBy);

      if (!extractedProduct) {
        return;
      }

      setSearchResults(
        searchProducts({
          extractedProduct,
          products: mockProducts,
          userLocation,
          sortBy: nextSortBy,
        })
      );
    },
    [extractedProduct, userLocation]
  );

  const reset = useCallback(() => {
    setProductPhoto(null);
    setLabelPhoto(null);
    setExtractedProduct(null);
    setSearchResults([]);
    setSortBy("similarity");
    setAnalysisStatus("idle");
    setAnalysisErrorMessage(null);
  }, []);

  const value = useMemo<PrendIAContextValue>(
    () => ({
      productPhoto,
      labelPhoto,
      setProductPhoto,
      setLabelPhoto,
      extractedProduct,
      searchResults,
      userLocation,
      sortBy,
      analysisStatus,
      analysisErrorMessage,
      runAnalysis,
      changeSortBy,
      reset,
    }),
    [
      productPhoto,
      labelPhoto,
      extractedProduct,
      searchResults,
      userLocation,
      sortBy,
      analysisStatus,
      analysisErrorMessage,
      runAnalysis,
      changeSortBy,
      reset,
    ]
  );

  return <PrendIAContext.Provider value={value}>{children}</PrendIAContext.Provider>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrendIAProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </PrendIAProvider>
    </SafeAreaProvider>
  );
}
