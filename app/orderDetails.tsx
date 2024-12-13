import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { priceWithTrailingZerosAndDollar } from "../lib/utils"
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type OrderDetailsRouteParams = {
  orderId: string;
};

const OrderDetails = () => {
  const [items, setItems] = useState<any[] | null>([]);
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const route = useRoute<RouteProp<{ params: OrderDetailsRouteParams }, "params">>();
  const { orderId } = route.params;

  const load_data = async () => {
    const { data: orderDetailsList, error: errorOrderDetailsList } = await supabase.from('order_items').select('product_id, quantity, total_price, status, products ( id, image_path, price, product_name, pickup_address, seller_id, user_profiles( phone_number ) )').eq('order_id', orderId)
    setItems(orderDetailsList)
  }
  
  useEffect(() => {
    load_data()
  }, []);
  
  return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {
            items!.length > 0 ?
            (
              <View style={styles.ItemsContainer}>
              {
                <View style={styles.PhoneNumberConatiner}>
                  <Text style={styles.textPhoneNumber}>Phone number of seller: {(items != null) ? (items[0].products.user_profiles.phone_number) : ('loading...')}</Text>
                </View>
              }
              
              {
                items?.map((item, id) => {
                  console.log('item', item)
                  const {data:image_url} = supabase.storage.from("product_images").getPublicUrl(item.products.image_path);
                  let locationObj = JSON.parse(item.products.pickup_address);
                  let addressAsString: string = locationObj.city + "\n" + locationObj.street + " " + locationObj.house_number + "\n" + locationObj.postal_code
                  
                  return <TouchableOpacity style={styles.ItemContainer} onPress={() => navigation.navigate("productDetails", { productId: item.products.id, productName: item.products.product_name, productPrice: item.products.price, productImage: item.products.image_path ? image_url.publicUrl : null, })} key={id}> 
                    <View style={styles.ItemContainerInside}>
                      <Image style={styles.image} source={item.products.image_path ? { uri: image_url.publicUrl } : require("../assets/samples/question.png")}></Image>
                      <View>
                        <Text style={styles.textLarger}>{item.products.product_name}</Text>
                        <Text style={styles.textSmaller}>Quantity: {item.quantity}</Text>
                        <Text style={styles.textSmaller}>{addressAsString}</Text>
                      </View>
                    </View>
                    <Text style={styles.textRight}>{priceWithTrailingZerosAndDollar(item.products.price)}</Text>
                  </TouchableOpacity>
                })
              }
              </View>
            ) : 
            (
              <View style={styles.SearchFailedContainer}>
                <TouchableOpacity>
                  <Feather name='loader' style={styles.IconLarge}></Feather>
                </TouchableOpacity>
                <Text style={styles.SearchFailedLook}>Loading...</Text>
              </View>
            )
          }
        </ScrollView>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: 5,
  },

  textTitle: {
    fontSize: 30,
    fontWeight: '700'
  },

  ItemsContainer:{
    alignItems: 'center',
    width: '100%'
  },

  SearchFailedContainer:{
    flexDirection: 'column',
    alignItems: 'center'
  },

  SearchFailedImage:{
    height: 175,
    width: 175
  },

  SearchFailedLook:{
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 25,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center'
  },

  ItemContainer:{
    width: '95%',
    flexDirection: 'row',
    backgroundColor: '#bfbfbf',
    marginVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  Icon:{
    fontSize: 30,
    paddingVertical: 20,
    paddingHorizontal: 10
  },

  IconLarge:{
    fontSize: 75
  },

  textLarger:{
    fontSize: 18,
    fontWeight: '500'
  },

  textSmaller:{
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#525252'
  },

  textRight:{
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10
  },

  image:{
    width: 75,
    height: 75,
    margin: 10,
    borderRadius: 15,
    resizeMode: "contain",
  },

  PhoneNumberConatiner:{
    backgroundColor: '#8b61ff',
    borderRadius: 20,
    padding: 10
  },

  textPhoneNumber:{
    fontSize: 18,
    fontWeight: '500',
    color: 'white'
  },

  ItemContainerInside:{
    flexDirection: 'row'
  }
})

export default OrderDetails;