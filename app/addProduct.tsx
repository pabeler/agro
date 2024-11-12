import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Alert, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { Href, Link, router } from 'expo-router';
import { productName } from 'expo-device';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import DateTimePicker from '@react-native-community/datetimepicker';

const addProduct = () => {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);   
  const categories = ['Cereals', 'Spices', 'Vegetables', 'Fruits', 'Dairy', 'Mushrooms'];  
  const [imageUri, setImageUri] = useState<string | null>(null); 
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const pickImage = async () => {
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission denied", "Permission to access media library is required!");
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
    if (!imageUri) return null;
    
    try {
      const response = await fetch(imageUri);
      const arraybuffer = await fetch(imageUri).then((res) => res.arrayBuffer())

      const imagePath = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}`; 
      console.log('siekkka', response);
      const { error } = await supabase.storage.from('product_images').upload(imagePath, arraybuffer, {
        contentType: 'image/jpeg',
      })

      if (error) throw error;
      
      return imagePath;
    } catch (error) {
      Alert.alert("Error", "Image upload failed.");
      console.log(error);
      return null;
    }
  };

  const handleSubmit = async () => {
    
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      Alert.alert("Error", "User is not logged in.");
      return;
    }

    let selectedCategoryId = 2;
    if(selectedCategory == 'Spices')
      selectedCategoryId = 3;
    if(selectedCategory == 'Vegetables')
      selectedCategoryId = 4;
    if(selectedCategory == 'Fruits')
      selectedCategoryId = 5;
    if(selectedCategory == 'Dairy')
      selectedCategoryId = 6;
    if(selectedCategory == 'Mushrooms')
      selectedCategoryId = 7;

    if (!selectedCategoryId) {
      Alert.alert("Error", "Please select a valid category.");
      return;
    }

    const uploadedImagePath = await uploadImage();

    console.log(uploadedImagePath);
    try {
      const { error } = await supabase.from('products').insert([
        {
          product_name: title,
          category_id: selectedCategoryId,
          price: parseFloat(price),
          stock_quantity: parseFloat(amount),
          seller_id: userId,
          description: description,
          image_path: uploadedImagePath,
        },
      ]);

      if (error) throw error;
      
      Alert.alert("Success", "Product added successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add product.");
    }
  };



  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={80} 
  >
    <ScrollView style={{ padding: 20, paddingBottom: 20 }}>
      <Text style={{ fontSize: 20 }}>Add product:</Text>
      
      <View style={[styles.verticallySpaced, styles.mt20]}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Expiration Date:</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>


      <View style={[styles.verticallySpaced, styles.mt20]}>
      <Input
          label="Product name"
          onChangeText={(text) => setTitle(text)}
          value={title}
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
            label="Amount (kg)"
            onChangeText={setAmount}
            value={amount}
            autoCapitalize={'none'}
            keyboardType="phone-pad"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
            label="Price"
            onChangeText={setPrice}
            value={price}
            autoCapitalize={'none'}
            keyboardType="phone-pad"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Description"
          onChangeText={setDescription}
          value={description}
          autoCapitalize={'none'}
          multiline={true} 
          numberOfLines={4} 
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
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
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Add image" onPress={pickImage} buttonStyle={styles.button} />
        {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100, marginTop: 10 }} />}
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Add product" onPress={handleSubmit} buttonStyle={styles.button2} />
      </View>
      
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {   
    borderRadius: 20,  
  },
  button2: {   
    borderRadius: 20,
    marginBottom:20,  
  },
  dateText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default addProduct;
