import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Image, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Card } from "@rneui/themed";
import { useRouter } from "expo-router";

const SellerPanel = () => {
  const router = useRouter();
  const [salesStats, setSalesStats] = useState<{
    totalSold: number;
    totalRevenue: number;
  }>({
    totalSold: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        Alert.alert("Error", "User is not logged in.");
        setLoading(false);
        return;
      }

      try {
        // Pobierz statystyki sprzedaży
        const { data: statsData, error: statsError } = await supabase.rpc(
          "get_sales_stats",
          { seller_id: userId }
        );

        if (statsError) {
          console.error("Error fetching sales stats:", statsError);
        } else if (statsData) {
          setSalesStats({
            totalSold: statsData[0]?.total_sold || 0,
            totalRevenue: statsData[0]?.total_revenue || 0,
          });
        }

        // Pobierz listę produktów sprzedawcy
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, product_name, price, stock_quantity, image_path")
          .eq("seller_id", userId);

        if (productsError) {
          console.error("Error fetching products:", productsError);
        } else {
          setProducts(productsData || []);
        }
      } catch (error) {
        console.error("Error fetching seller data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  const handleEditProduct = (productId: number) => {
    router.push({
      pathname: "/EditProduct",
      params: { productId },
    });
  };

  const handleDeleteProduct = async (productId: number) => {
    Alert.alert("Confirmation", "Are you sure you want to delete this product?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("products")
              .delete()
              .eq("id", productId);

            if (error) {
              Alert.alert("Error", "Failed to delete product.");
            } else {
              Alert.alert("Sukces", "Product has been removed.");
              setProducts((prev) =>
                prev.filter((product) => product.id !== productId)
              );
            }
          } catch (error) {
            console.error("Error deleting product:", error);
            Alert.alert("Error", "Failed to delete product.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My products</Text>

      {loading ? (
        <Text>Loading data...</Text>
      ) : (
        <>

          {/* Lista produktów */}
          <FlatList
  data={products}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <Card containerStyle={styles.card}>
      <View style={styles.cardContent}>
        {/* Zdjęcie produktu */}
        {item.image_path && (
          <Image
            source={{
              uri: supabase.storage.from('product_images').getPublicUrl(item.image_path).data.publicUrl,
            }}
            style={styles.productImage}
          />
        )}

        {/* Szczegóły produktu */}
        <View style={styles.productDetails}>
          <Text style={styles.productTitle}>{item.product_name}</Text>
          <Text style={styles.productInfo}>Price: {item.price} zł</Text>
          <Text style={styles.productInfo}>Stock: {item.stock_quantity}</Text>
        </View>
      </View>

      {/* Przyciski */}
      <View style={styles.actionButtons}>
        <Button
          title="Edytuj"
          onPress={() => handleEditProduct(item.id)}
          buttonStyle={styles.editButton}
        />
        <Button
          title="Usuń"
          onPress={() => handleDeleteProduct(item.id)}
          buttonStyle={styles.deleteButton}
        />
      </View>
    </Card>
  )}
/>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row', // Układ poziomy dla zdjęcia i szczegółów
    alignItems: 'center', // Wyrównanie do środka
    marginBottom: 12, // Odsunięcie od przycisków
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 16, // Odstęp między zdjęciem a szczegółami
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1, // Zajmuje resztę przestrzeni obok zdjęcia
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productInfo: {
    fontSize: 14,
    marginBottom: 2,
    color: '#555',
  },
  actionButtons: {
    flexDirection: 'row', // Układ poziomy dla przycisków
    justifyContent: 'space-between', // Rozdzielenie przycisków
  },
  editButton: {
    backgroundColor: '#007bff',
    width: '48%', // Przyciski zajmują 48% szerokości kontenera
    minWidth: 100, // Minimalna szerokość, aby tekst mieścił się w jednej linii
    textAlign: 'center', // Wyrównanie tekstu w przycisku
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    width: '48%',
    minWidth: 100,
    textAlign: 'center',
  },
  statsText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
  },
});

export default SellerPanel;
