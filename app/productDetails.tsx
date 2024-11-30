import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { Button } from "@rneui/themed";

type ProductDetailsRouteParams = {
  productId: string;
  productName: string;
  productPrice: string;
  productImage?: string;
};

const ProductDetails = () => {
  const route = useRoute<RouteProp<{ params: ProductDetailsRouteParams }, "params">>();
  const { productId, productName, productPrice, productImage } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState<string | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const { data: descriptionData, error: descriptionError } = await supabase
          .from("products")
          .select("description")
          .eq("id", productId)
          .single();

        if (descriptionError) throw new Error(descriptionError.message);
        setDescription(descriptionData?.description || "No description available.");

        const { data: stockData, error: stockError } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", productId)
          .single();

        if (stockError) throw new Error(stockError.message);
        setStockQuantity(stockData?.stock_quantity || 0);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [productId]);

  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, stockQuantity || 10));
  const decreaseQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Image
          style={styles.image}
          source={productImage ? { uri: productImage } : require("../assets/samples/question.png")}
        />

        <Text style={styles.productName}>{productName}</Text>

        <Text style={styles.productPrice}>${productPrice}</Text>

        <View style={styles.quantityContainer}>
        <Text style={styles.amountText}>Amount:</Text>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={decreaseQuantity}
          >
            <Text style={styles.toggleButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={increaseQuantity}
          >
            <Text style={styles.toggleButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.productDescription}>{description}</Text>
      </ScrollView>

      <View style={styles.addToCartContainer}>
        <Button title="Add to Cart" buttonStyle={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10, 
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 10,
    resizeMode: "contain",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 20,
    color: "gray",
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  toggleButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  productDescription: {
    fontSize: 16,
    color: "gray",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  addToCartContainer: {
    paddingHorizontal: 20,
    marginBottom: 20, 
  },
  button: {
    borderRadius: 20,
  },
});

export default ProductDetails;
