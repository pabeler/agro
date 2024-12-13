import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { priceWithTrailingZerosAndDollar } from "../../lib/utils"
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

let loadNewOrders: boolean = true

const Orders = () => {
  const [items, setItems] = useState<any[] | null>([]);
  const navigation = useNavigation<NativeStackNavigationProp<any>>()

  const load_data = async () => {
    if(loadNewOrders) {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: orderList, error: errorOrderList } = await supabase.from('orders').select('created_at, id, status, total_price').eq('user_id', session?.user.id).eq('status', 'unrealized')
      setItems(orderList)
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: orderList, error: errorOrderList } = await supabase.from('orders').select('created_at, id, status, total_price').eq('user_id', session?.user.id).neq('status', 'unrealized')
      setItems(orderList)
    }
    
  }
  


    useFocusEffect(
      useCallback(() => {
        load_data();
      }, [])
    );
  
  return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <Text style={styles.textTitle}>Pending Orders</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={loadNewOrders ? styles.buttonContainerActive : styles.buttonContainerInactive} onPress={() => {loadNewOrders = !loadNewOrders; load_data()}}>
              <Text style={loadNewOrders ? styles.buttonTextActive : styles.buttonTextInactive}>New orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={!loadNewOrders ? styles.buttonContainerActive : styles.buttonContainerInactive} onPress={() => {loadNewOrders = !loadNewOrders; load_data()}}>
              <Text style={!loadNewOrders ? styles.buttonTextActive : styles.buttonTextInactive}>Confirmed orders</Text>
            </TouchableOpacity>
          </View>
          
          {
            items!.length > 0 ?
            (
              <View style={styles.ItemsContainer}>
                {
                  items?.map((item, id) => {
                    let item_date : Date = new Date(item.created_at)
                    let item_date_year : string = item_date.getFullYear().toString()
                    let item_date_month : string = item_date.getMonth().toString()
                    let item_date_day : string = item_date.getDay().toString()
                    let item_date_hour : string = item_date.getHours().toString()
                    let item_date_minute : string = item_date.getMinutes().toString()
                    let item_date_seconds : string = item_date.getSeconds().toString()
                    let item_date_str : string = item_date_year + '.' + item_date_month + '.' + item_date_day + ' ' + item_date_hour + ':' + item_date_minute + ':' + item_date_seconds
                    
                    return <TouchableOpacity onPress={() => navigation.navigate("orderDetails", { orderId: item.id })} style={styles.ItemContainer} key={id}>
                      <TouchableOpacity>
                        <Feather name='shopping-bag' style={styles.Icon}/>
                      </TouchableOpacity>
                      <View>
                        <Text style={styles.textLarger}>Ordered on {item_date_str}</Text>
                        <Text style={styles.textSmaller}>Totaling {priceWithTrailingZerosAndDollar(item.total_price)}</Text>
                      </View>
                      <TouchableOpacity>
                        <Feather name='chevron-right' style={styles.Icon}/>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  })
                }
              </View>
            ) :
            (
              <View style={styles.SearchFailedContainer}>
                <Image style={styles.SearchFailedImage} source={require('../../assets/samples/question.png')}></Image>
                <Text style={styles.SearchFailedLook}>You have no orders of this kind right now.</Text>
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

  buttonsContainer:{
    flexDirection: 'row'
  },

  buttonContainerActive:{
    marginHorizontal: 20,
    backgroundColor: '#8b61ff',
    borderRadius: 15
  },

  buttonContainerInactive:{
    marginHorizontal: 20,
    backgroundColor: '#bfbfbf',
    borderRadius: 15
  },

  buttonTextActive:{
    color: 'white',
    fontSize: 20,
    padding: 10
  },

  buttonTextInactive:{
    color: 'black',
    fontSize: 20,
    padding: 10
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
    marginTop: 10,
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

  textLarger:{
    fontSize: 18,
    fontWeight: '500'
  },

  textSmaller:{
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#525252'
  }
})

export default Orders;
