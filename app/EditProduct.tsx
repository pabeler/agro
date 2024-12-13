import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Alert, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input, Card } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

const EditProduct = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams(); // Odczyt ID produktu
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = ['Cereals', 'Spices', 'Vegetables', 'Fruits', 'Dairy', 'Mushrooms'];
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [initialImagePath, setInitialImagePath] = useState<string | null>(null); // Ścieżka początkowego obrazu

  useEffect(() => {
    if (!productId) {
      Alert.alert('Error', 'Product ID is missing.');
      router.push('/sellerPanel');
      return;
    }

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('product_name, price, stock_quantity, description, category_id, image_path')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to fetch product data.');
        router.push('/sellerPanel');
        return;
      }

      if (data) {
        setTitle(data.product_name);
        setPrice(data.price.toString());
        setAmount(data.stock_quantity.toString());
        setDescription(data.description);
        setSelectedCategory(categories[data.category_id - 1]);
        setInitialImagePath(data.image_path);
      }
    };

    fetchProduct();
  }, [productId]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission denied', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) return initialImagePath;
    try {
      const response = await fetch(imageUri);
      const arraybuffer = await fetch(imageUri).then((res) => res.arrayBuffer());

      const imagePath = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const { error } = await supabase.storage.from('product_images').upload(imagePath, arraybuffer, {
        contentType: 'image/jpeg',
      });

      if (error) throw error;

      return imagePath;
    } catch (error) {
      Alert.alert('Error', 'Image upload failed.');
      console.log(error);
      return null;
    }
  };

  const handleUpdate = async () => {
    const uploadedImagePath = await uploadImage();

    try {
      const { error } = await supabase
        .from('products')
        .update({
          product_name: title,
          category_id: categories.indexOf(selectedCategory!) + 1,
          price: parseFloat(price),
          stock_quantity: parseFloat(amount),
          description,
          image_path: uploadedImagePath,
        })
        .eq('id', productId);

      if (error) throw error;

      Alert.alert('Success', 'Product updated successfully!');
      router.push('/sellerPanel');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update product.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.header}>Edit Product</Text>

        <Card containerStyle={styles.card}>
          <Input
            label="Product Name"
            placeholder="Enter product name"
            onChangeText={(text) => setTitle(text)}
            value={title}
            inputContainerStyle={styles.input}
          />
          <Input
            label="Amount (kg)"
            placeholder="Enter product amount"
            onChangeText={setAmount}
            value={amount}
            keyboardType="numeric"
            inputContainerStyle={styles.input}
          />
          <Input
            label="Price"
            placeholder="Enter price"
            onChangeText={setPrice}
            value={price}
            keyboardType="numeric"
            inputContainerStyle={styles.input}
          />
          <Input
            label="Description"
            placeholder="Enter product description"
            onChangeText={setDescription}
            value={description}
            multiline
            numberOfLines={4}
            inputContainerStyle={styles.input}
          />

          <Text style={styles.label}>Category</Text>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a category" value={null} />
            {categories.map((category, index) => (
              <Picker.Item key={index} label={category} value={category} />
            ))}
          </Picker>
        </Card>

        <Card containerStyle={styles.card}>
  <Text style={styles.label}>Product Image</Text>
  <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
    <Text style={styles.imageButtonText}>{imageUri ? 'Change Image' : 'Change Image'}</Text>
  </TouchableOpacity>
  {imageUri ? (
    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
  ) : initialImagePath ? (
    <Image
      source={{
        uri: supabase.storage.from('product_images').getPublicUrl(initialImagePath).data.publicUrl,
      }}
      style={styles.imagePreview}
    />
  ) : null}
</Card>

        <Button title="Update Product" onPress={handleUpdate} buttonStyle={styles.submitButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#555',
  },
  input: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  picker: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  imageButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    paddingVertical: 12,
    marginTop: 20,
  },
});

export default EditProduct;
