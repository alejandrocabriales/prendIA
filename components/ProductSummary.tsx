import React from "react";
import { Text, View } from "react-native";

import { ExtractedProduct } from "../types";

type ProductSummaryProps = {
  extractedProduct: ExtractedProduct;
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Shows what the AI detected from the user's photos. Any field the AI
 * couldn't determine is simply omitted — never shown as "N/A" or a guess.
 */
export function ProductSummary({ extractedProduct }: ProductSummaryProps) {
  const title = [extractedProduct.category, extractedProduct.subcategory]
    .filter((value): value is string => Boolean(value))
    .map(capitalize)
    .join(" ");

  const details: string[] = [];
  if (extractedProduct.color) details.push(capitalize(extractedProduct.color));
  if (extractedProduct.brand) details.push(extractedProduct.brand);
  if (extractedProduct.size) details.push(`Talle ${extractedProduct.size}`);
  if (extractedProduct.price) details.push(`$${extractedProduct.price.toLocaleString("es-UY")}`);

  return (
    <View className="rounded-2xl bg-neutral-100 p-4">
      <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
        Prenda detectada
      </Text>
      <Text className="text-lg font-bold text-neutral-900">{title || "Prenda"}</Text>

      {details.length > 0 ? (
        <View className="mt-2 flex-row flex-wrap gap-2">
          {details.map((detail) => (
            <View key={detail} className="rounded-full bg-white px-3 py-1">
              <Text className="text-xs font-medium text-neutral-700">{detail}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {extractedProduct.visualAttributes.length > 0 ? (
        <Text className="mt-2 text-xs text-neutral-500">
          {extractedProduct.visualAttributes.join(" · ")}
        </Text>
      ) : null}
    </View>
  );
}
