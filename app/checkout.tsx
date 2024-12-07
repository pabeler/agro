import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Pressable, View, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from "@react-navigation/native";
import { priceWithTrailingZerosAndDollar, ProductType, PRODUCTS_STORAGE_KEY } from "../lib/utils";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardField, confirmPlatformPayPayment, PlatformPay, PlatformPayButton, StripeProvider, useConfirmPayment, usePlatformPay, CardFieldInput } from '@stripe/stripe-react-native';

type CheckoutRouteParams = {
  items : any[] | null
};

const checkoutForm = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const route = useRoute<RouteProp<{ params: CheckoutRouteParams }, "params">>();
  const { items } = route.params
  const [sum, setSum] = useState(0)
  const [goToHomepageFlag, setGoToHomepageFlag] = useState(false)
  const {isPlatformPaySupported} = usePlatformPay();

  const calculate_sum = () => {
    let sum: number = 0
    
    items?.forEach((item) => {
      sum = sum + item.price * item.quantity
    });

    return sum
  }

  const pay = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
  
      if (!userId) {
        Alert.alert('Error', 'User is not logged in.');
        return;
      }
      
      type SellerAndProducts = {
        sellerId: string,
        productIdsQithQuantities: ProductType[]
      }
  
      let sellers : SellerAndProducts[] = []
  
      for(let item of items!) {
        let addedProductFlag : boolean = false
        
        for(let seller of sellers) {
          if(seller.sellerId == item.seller_id) {
            let newProduct : ProductType = {} as ProductType
            newProduct.productId = item.id
            newProduct.quantity = item.quantity
            newProduct.price = item.price
            seller.productIdsQithQuantities.push(newProduct)
            addedProductFlag = true
            break
          }
        }
  
        if(!addedProductFlag) {
          let newSeller : SellerAndProducts = {} as SellerAndProducts
          newSeller.sellerId = item.seller_id
          newSeller.productIdsQithQuantities = []
          sellers.push(newSeller)

          let newProduct : ProductType = {} as ProductType
          newProduct.productId = item.id
          newProduct.quantity = item.quantity
          newProduct.price = item.price
          newSeller.productIdsQithQuantities.push(newProduct)
        }
      }
  
      for(let seller of sellers) {
        let sumForSeller : number = 0
        for(let product of seller.productIdsQithQuantities) {
          sumForSeller = sumForSeller + product.price! * product.quantity
        }
        
        const { data : insertedOrder, error : errorOrder } = await supabase.from('orders').insert({ user_id: userId, status: 'unrealized', total_price: sumForSeller }).select()
        console.log(insertedOrder)
  
        for(let product of seller.productIdsQithQuantities) {
          let insertedOrderData : any = (insertedOrder as any)[0]
          
          const { error : errorOrderItem } = await supabase.from('order_items')
          .insert({ product_id: product.productId, order_id: insertedOrderData.id, quantity: product.quantity, total_price: (product.price! * product.quantity), status: 'unrealized'})
        }
      }

      const clientSecret = await fetchPaymentIntentClientSecret();

      const { error } = await confirmPlatformPayPayment(
        clientSecret,
        {
          googlePay: {
            testEnv: true,
            merchantName: 'My merchant name',
            merchantCountryCode: 'US',
            currencyCode: 'USD',
            billingAddressConfig: {
              format: PlatformPay.BillingAddressFormat.Full,
              isPhoneNumberRequired: true,
              isRequired: true,
            },
          },
        }
      );

      if (error) {
        Alert.alert(error.code, error.message);
        return;
      }

      await AsyncStorage.removeItem(PRODUCTS_STORAGE_KEY)
      Alert.alert('Success', 'Paid for products successfully!')
      setGoToHomepageFlag(true)
    } catch(error) {
      console.error(error)
    }
  }

  const fetchPaymentIntentClientSecret = async () => {
    let amountForResponse : number = calculate_sum()
    const { data: { session } } = await supabase.auth.getSession();

    if (!(session?.user.id)) {
      return;
    }

    const response = await fetch(`https://retbvrtntihuepnbhbdm.supabase.co/functions/v1/stripe-intent`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ${session.access_token}',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currency: 'pln',
          amount: amountForResponse,
          items: [{id: 'id'}],
        }),
    });

    const {paymentIntent} = await response.json();
    return paymentIntent;
  };
  
  useEffect(() => {
    if(goToHomepageFlag) {
      navigation.navigate('(tabs)', { screen: 'homePage' })
    }

    const checkGooglePayAvailability = async () => {
      const isSupported = await isPlatformPaySupported({
        googlePay: { testEnv: true },
      });

      if (!isSupported) {
        Alert.alert('Google Pay is not supported on this device.');
      } else {
        console.log('Google Pay is supported on this device.');
      }
    }
    checkGooglePayAvailability()
    
    setSum(calculate_sum())
    console.log('Downloading data', items)
  }, []);
  
  return (
    <StripeProvider publishableKey="pk_test_51QKR2aGdAw5vtKPeyQmOYWxTWLLDyqfXxmxFtqSVXGS14eCXNnNuWepsLy0HX0PKYnvl1BtMHazGurbfCEf5NCkP00rlEkGWsS">
      <View style={style.MainContainer}>
        <View style={style.CheckoutHeader}>
          <Pressable style={style.BackButton} onPress={() => { navigation.goBack() }}>
            <TouchableOpacity>
              <Feather name='chevron-left' style={style.BackIcon}/>
            </TouchableOpacity>
          </Pressable>
          <Text style={style.CheckoutHeaderText}>Checkout</Text>
          </View>

          <View style={style.InformationConatiner}>
            <Text style={style.InformationText}>You are going to make a payment totaling for {priceWithTrailingZerosAndDollar(sum)}.</Text>
          </View>

          <View style={style.FooterContainer}>
            <PlatformPayButton style={style.GooglePayButton} type={PlatformPay.ButtonType.Pay} onPress={() => {pay()}}></PlatformPayButton>
          </View>
      </View>
    </StripeProvider>
  );
};

const style = StyleSheet.create({
  MainContainer:{
    flex: 1
  },

  InformationConatiner:{
    marginTop: 50,
    alignItems: 'center',
  },

  InformationText:{
    color: 'black',
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center'
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

  CheckoutHeader:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '65%'
  },

  CheckoutHeaderText:{
    fontSize: 28,
    fontWeight: '600'
  },

  FooterContainer:{
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },

  CheckoutButtonView:{
    backgroundColor: '#3895E0',
    margin: 10,
    borderRadius: 10,
    padding: 10
  },

  CheckoutText:{
    fontSize: 28,
    fontWeight: '600',
    color: 'white'
  },

  GooglePayButton:{
    height: 100,
    width: '90%',
    marginBottom: 20
  }
})

export default checkoutForm;