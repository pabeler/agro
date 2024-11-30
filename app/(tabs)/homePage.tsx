import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../../lib/supabase';
import { priceWithTrailingZerosAndDollar } from '../../lib/utils';
import React from 'react';

const Screen = () => {
  const [searchInput, setSearchInput] = useState("")
  const [bestsellers, setBestsellets] = useState<any[] | null>([]);
  const [newItems, setNewItems] = useState<any[] | null>([]);
  const navigation = useNavigation<NativeStackNavigationProp<any>>()

  const onSumbitSearch = () => {
    navigation.push("searchResults", {input: searchInput})
  }

  const navigateToCategory = (category: string) => {
    navigation.push("categoryItems", {category: category})
  }

  useEffect(() => {
    load_data?.()
  }, []);

  const load_data = async () => {
    let MAX_RESULTS: number = 5
    {
      const { data, error } = await supabase.from('products').select('id, product_name, image_path, price').limit(MAX_RESULTS) //bestsellery
      setBestsellets(data)
    }
    {
      const { data, error } = await supabase.from('products').select('id, product_name, image_path, price').order('created_at', { ascending: false }).limit(MAX_RESULTS) //nowe
      setNewItems(data)
    }
  }
  
  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        <View style={style.MainContainer}>
          
          <View style={style.SearchBarContainer}>
            <View style={style.SearchButton}>
              <TouchableOpacity>
                <Feather name='search' style={style.SearchIcon}/>
              </TouchableOpacity>
            </View>
            <View style={style.SearchBar}>
              <TextInput style={style.SearchInput}
              placeholder='Search for products...'
              value={searchInput}
              onChangeText={(value) => setSearchInput(value)}
              onSubmitEditing={onSumbitSearch}></TextInput>
            </View>
          </View>

          <View style={style.CategoriesLinkContainer}>
            <Text style={style.TextLook}>Categories</Text>
            <Text style={style.TextLook}><Link href='../categories' style={style.LinkLook}>See All</Link></Text>
          </View>

          <ScrollView style={style.CategoriesIconsScrollContainer} horizontal={true}>
            <View style={style.CategoryIconContainer}>
              <TouchableOpacity style={style.CategoryIcon} onPress={() => {navigateToCategory('cereals')}}>
                <Image source={require('../../assets/category_icons/wheat.png')}></Image>
                <Text style={style.TextSmaller}>Cereals</Text>
              </TouchableOpacity>
            </View>
            <View style={style.CategoryIconContainer}>
              <TouchableOpacity style={style.CategoryIcon} onPress={() => {navigateToCategory('vegetables')}}>
                <Image source={require('../../assets/category_icons/potato.png')}></Image>
                <Text style={style.TextSmaller}>Vegetables</Text>
              </TouchableOpacity>
            </View>
            <View style={style.CategoryIconContainer}>
              <TouchableOpacity style={style.CategoryIcon} onPress={() => {navigateToCategory('fruits')}}>
                <Image source={require('../../assets/category_icons/apple.png')}></Image>
                <Text style={style.TextSmaller}>Fruits</Text>
              </TouchableOpacity>
            </View>
            <View style={style.CategoryIconContainer}>
              <TouchableOpacity style={style.CategoryIcon} onPress={() => {navigateToCategory('dairy')}}>
                <Image source={require('../../assets/category_icons/milk.png')}></Image>
                <Text style={style.TextSmaller}>Dairy</Text>
              </TouchableOpacity>
            </View>
            <View style={style.CategoryIconContainer}>
              <TouchableOpacity style={style.CategoryIcon} onPress={() => {navigateToCategory('spices')}}>
                <Image source={require('../../assets/category_icons/sesame.png')}></Image>
                <Text style={style.TextSmaller}>Spices</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <Text style={style.TextLook}>Bestsellers</Text>

          <ScrollView style={style.BestsellersContainer} horizontal={true}>
            {
              bestsellers?.map((item, id) => {
                if(item.image_path != null) {
                  const {data:image_url} = supabase.storage.from("product_images").getPublicUrl(item.image_path);
                  
                  return <TouchableOpacity style={style.BestsellerView} key={id} onPress={() => 
                    navigation.navigate("productDetails", {
                      productId: item.id,
                      productName: item.product_name,
                      productPrice: item.price,
                      productImage: item.image_path ? image_url.publicUrl : null,
                    })}>
                    <Image style={style.BestsellerImage} source={{ uri: image_url.publicUrl }}></Image>
                    <Text style={style.TextDescription}>{item.product_name}</Text>
                    <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.price)}</Text>
                    </TouchableOpacity>
                } else {
                  return <TouchableOpacity style={style.BestsellerView} key={id} onPress={() => 
                    navigation.navigate("productDetails", {
                      productId: item.id,
                      productName: item.product_name,
                      productPrice: item.price,
                      productImage: null,
                    })}>
                    <Image style={style.BestsellerImage} source={require('../../assets/samples/question.png')}></Image>
                    <Text style={style.TextDescription}>{item.product_name}</Text>
                    <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.price)}</Text>
                    </TouchableOpacity>
                }
              })
            }
          </ScrollView>

          <Text style={style.TextLook}>New in</Text>

          <ScrollView style={style.BestsellersContainer} horizontal={true}>
            {
              newItems?.map((item, id) => {
                if(item.image_path != null) {
                  const {data:image_url} = supabase.storage.from("product_images").getPublicUrl(item.image_path);
                  
                  return <TouchableOpacity style={style.BestsellerView} key={id} onPress={() => 
                    navigation.navigate("productDetails", {
                      productId: item.id,
                      productName: item.product_name,
                      productPrice: item.price,
                      productImage: item.image_path ? image_url.publicUrl : null,
                    })}>
                    <Image style={style.BestsellerImage} source={{ uri: image_url.publicUrl }}></Image>
                    <Text style={style.TextDescription}>{item.product_name}</Text>
                    <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.price)}</Text>
                    </TouchableOpacity>
                } else {
                  return <TouchableOpacity style={style.BestsellerView} key={id} onPress={() => 
                    navigation.navigate("productDetails", {
                      productId: item.id,
                      productName: item.product_name,
                      productPrice: item.price,
                      productImage:  null,
                    })}>
                    <Image style={style.BestsellerImage} source={require('../../assets/samples/question.png')}></Image>
                    <Text style={style.TextDescription}>{item.product_name}</Text>
                    <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.price)}</Text>
                    </TouchableOpacity>
                }
              })
            }
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  ScrollViewLook:{
    height: '100%'
  },
  
  MainContainer:{
    flexDirection: 'column',
    flex: 1
  },

  SearchBarContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    width: '80%',
    alignSelf: 'center'
  },

  SearchBar:{
    backgroundColor: '#D3D3D3',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: '95%'
  },

  SearchInput:{
    backgroundColor: '#D3D3D3',
    fontSize: 15,
    marginLeft: 10,
    width: '95%',
    fontWeight: '600'
  },

  SearchButton:{
    backgroundColor: '#D3D3D3',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },

  SearchIcon:{
    fontSize: 25,
    marginLeft: 10
  },

  CategoriesLinkContainer:{
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width:'100%',
    marginTop: 20
  },

  TextLook:{
    marginHorizontal: 20,
    marginVertical: 30,
    fontSize: 15,
    fontWeight: '600'
  },

  TextSmaller:{
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic'
  },

  TextDescription:{
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    padding: 2,
    marginHorizontal: 4
  },

  LinkLook:{
    fontStyle: 'italic'
  },

  CategoriesIconsScrollContainer:{
    marginHorizontal: 20,
    marginVertical: 10,
    width: '100%'
  },

  CategoryIcon:{
    marginHorizontal: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 70
  },

  CategoryIconContainer:{
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 70
  },

  BestsellersContainer:{
    width: '95%',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    height: 210
  },

  BestsellerView:{
    flexDirection: 'column',
    backgroundColor: '#D3D3D3',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: 5
  },

  BestsellerImage:{
    height: 150,
    width: 150
  }
})

export default Screen;