import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image} from 'react-native'
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { priceWithTrailingZerosAndDollar } from '../../lib/utils';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS_STORAGE_KEY, ProductType } from "../../lib/utils";

const UserCart = () => {
  const [items, setItems] = useState<any[] | null>([])
  const navigation = useNavigation<NativeStackNavigationProp<any>>()

  const load_data = async () => {
    const savedProductValues = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);

    if(savedProductValues == null) {
      return
    }

    let productsAsJson = JSON.parse(savedProductValues);
    let productsIds : number[] = []
    
    productsAsJson.forEach((element : ProductType) => {
      productsIds.push(element.productId)
    });

    const {data, error} = await supabase.from('products').select('id, price, image_path, product_name, stock_quantity, quantity:price, seller_id').in('id', productsIds)
    console.log('Data downloaded from table:', data)
    console.log('Data loaded from disc:', productsAsJson)

    for(let item of data!) {
      for(let itemWithData of productsAsJson) {
        if(itemWithData.productId == item.id) {
          item.quantity = itemWithData.quantity
          break
        }
      }
    }

    console.log('Data transformed:', data)
    setItems(data)
  }

  const calculate_sum = () => {
    let sum: number = 0
    
    items?.forEach((item) => {
      sum = sum + item.price * item.quantity
    });

    return sum
  }

  const remove_all_items = async () => {
    await AsyncStorage.removeItem(PRODUCTS_STORAGE_KEY)
    setItems([])
  }

  const add_one_item = async (productId: number) => {
    for(let item of items!) {
      if(item.id == productId) {
        item.quantity = Math.min(item.quantity + 1, item.stock_quantity)
        break
      }
    }

    refresh_items()
    save_items_to_storage()
  }

  const remove_one_item = async (productId: number) => {
    for(let item of items!) {
      if(item.id == productId) {
        item.quantity = Math.max(item.quantity - 1, 0)
        break
      }
    }

    refresh_items()
    save_items_to_storage()
  }

  const save_items_to_storage = async () => {
    let itemsToSave : ProductType[] = []

    for(let item of items!) {
      let newProductToSave : ProductType = {} as ProductType
      newProductToSave.productId = item.id
      newProductToSave.quantity = item.quantity
      itemsToSave.push(newProductToSave)
    }

    let jsonString : string = JSON.stringify(itemsToSave)
    await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, jsonString)
  }

  const refresh_items = async () => {
    let newData : any[] = []

    for(let item of items!) {
      if(item.quantity != 0) {
        newData.push(item)
      }
    }

    setItems(newData)
  }

  const fetchUserData = async () => {
    const { data: { user }, error: authError, } = await supabase.auth.getUser();

    if (authError) {
      console.error('Błąd przy pobieraniu użytkownika:', authError);
    } else if (user) {
      load_data?.()
    }
  };

  const navigateToCheckout = async () => {
    navigation.navigate('checkout', { items: items })
  }

  useEffect(() => {
    console.log('Downloading data')
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );
  
  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        {
          (items!.length == 0) ? 
          (
            <View style={style.EmptyCartView}>
              <Image style={style.EmptyCartImage} source={require('../../assets/samples/bag.png')}></Image>
              <Text style={style.EmptyCartText}>Your cart is empty.</Text>
            </View>
          ) :
          (
            <View>
              <View style={style.CartHeader}>
                <Pressable style={style.BackButton} onPress={() => { navigation.goBack() }}>
                  <TouchableOpacity>
                    <Feather name='chevron-left' style={style.BackIcon}/>
                  </TouchableOpacity>
                </Pressable>
                <Text style={style.CartHeaderText}>Your Cart</Text>
              </View>
              
              <View style={style.LeftContainer}>
                <Text style={style.RemoveText} onPress={() => {remove_all_items()}}>Remove All</Text>
              </View>

              <View>
                {
                  items?.map((item, id) => {
                    const {data:image_url} = supabase.storage.from("product_images").getPublicUrl(item.image_path);
                
                    return <View style={style.ItemView} key={id}>
                      
                      <View style={style.TopRowItem}>
                        {
                          (item.image_path != null) ?
                          (
                            <Image style={style.ItemImage} source={{ uri: image_url.publicUrl }}></Image>
                          ) :
                          (
                            <Image style={style.ItemImage} source={require('../../assets/samples/question.png')}></Image>
                          )
                        }
                          
                        <View style={style.RowHeader}>
                          <View style={style.TopRowHeader}>
                            <Text style={style.TextDescription}>{item.product_name}</Text>
                            <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.price)}</Text>
                          </View>
                          <View style={style.BottomRowHeader}>
                            <Text style={style.BottomTextDescription}>Quantity</Text>
                            <TouchableOpacity style={style.PlusMinus} onPress={() => {add_one_item(item.id)}}>
                              <Feather name='plus' style={style.PlusMinusIcon}/>
                            </TouchableOpacity>
                            <Text style={style.BottomTextDescription}>{item.quantity}</Text>
                            <TouchableOpacity style={style.PlusMinus} onPress={() => {remove_one_item(item.id)}}>
                              <Feather name='minus' style={style.PlusMinusIcon}/>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  })
                }
              </View>

              <View style={style.FooterContainer}>
                <View style={style.MoneyView}>
                  <Text style={style.FooterMoneyText}>Subtotal</Text>
                  <Text style={style.FooterMoneyText}>{priceWithTrailingZerosAndDollar(calculate_sum())}</Text>
                </View>
                <View style={style.MoneyView}>
                  <Text style={style.FooterMoneyText}>Shipping Cost</Text>
                  <Text style={style.FooterMoneyText}>$0.00</Text>
                </View>
                <View style={style.MoneyView}>
                  <Text style={style.FooterMoneyText}>Total</Text>
                  <Text style={style.FooterMoneyText}>{priceWithTrailingZerosAndDollar(calculate_sum())}</Text>
                </View>
                <TouchableOpacity style={style.CheckoutButtonView} onPress={() => {navigateToCheckout()}}>
                  <Text style={style.CheckoutText}>Checkout</Text>
                </TouchableOpacity>
              </View>

            </View>
          )
        }
      </ScrollView>
    </View>
  )
}

const style = StyleSheet.create({
  ScrollViewLook:{
    height: '100%',
  },

  EmptyCartView:{
    width: '100%',
    height: 750,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
    
  },

  EmptyCartImage:{
    height: 200,
    width: 200
  },

  EmptyCartText:{
    fontSize: 32
  },

  BackButton:{
    backgroundColor: '#D3D3D3',
    borderRadius: 20,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginTop: 10,
    zIndex: 1.0
   },

   BackIcon:{
    fontSize: 20,
    zIndex: 0.0
  },

  CartHeader:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '65%'
  },

  CartHeaderText:{
    fontSize: 28,
    fontWeight: '600'
  },

  RemoveText:{
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
    marginRight: 20
  },

  LeftContainer:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  ItemView:{
    margin: 10,
    backgroundColor: '#D3D3D3',
    borderRadius: 10
  },

  ItemImage:{
    height: 80,
    width: 80,
    borderRadius: 10,
    margin: 10
  },

  TextDescription:{
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 17,
    marginTop: 25,
    marginLeft: 40
  },

  TopRowItem:{
    flexDirection: 'row'
  },

  TopRowHeader:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  BottomRowHeader:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  RowHeader:{
    flexDirection: 'column',
    width: '70%',
  },

  PlusMinus:{
    backgroundColor: '#3895E0',
    borderRadius: 20,
    width: 30,
    height: 30,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  PlusMinusIcon:{
    fontSize: 15,
    fontWeight: '900'
  },

  BottomTextDescription:{
    fontSize: 15,
    fontWeight: '900'
  },

  FooterContainer:{
    alignItems: 'center',
    width: '100%',
  },

  MoneyView:{
    width: '90%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8
  },

  CheckoutButtonView:{
    backgroundColor: '#3895E0',
    width: '90%',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },

  CheckoutText:{
    color: 'white',
    fontSize: 19,
    fontWeight: '900',
    fontStyle: 'italic'
  },

  FooterMoneyText:{
    color: 'grey',
    fontSize: 17,
    fontWeight: '900',
    fontStyle: 'italic'
  }
})

export default UserCart