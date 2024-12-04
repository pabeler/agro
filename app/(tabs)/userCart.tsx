import React, { useEffect, useState } from 'react'
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image} from 'react-native'
import { Feather } from '@expo/vector-icons';
import { useRoute} from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { priceWithTrailingZerosAndDollar } from '../../lib/utils';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

let cartId: number | null = null

const UserCart = () => {
  const [cart, setCart] = useState<any | null>(null)
  const [items, setItems] = useState<any[] | null>([])
  const navigation = useNavigation<NativeStackNavigationProp<any>>()

  const load_cart = async (userIdArg: string) => {
    const { data, error } = await supabase.from('orders').select('id, user_id, status, total_price').eq('user_id', userIdArg).limit(1)
    console.log('cart:', data)
    setCart(data)
    cartId = data![0].id
  }

  const load_data = async () => {
    if(cartId != null) {
      const { data, error } = await supabase.from('order_items').select('id, product_id, quantity, total_price, products( price, image_path, product_name, stock_quantity )').eq('order_id', cartId)
      console.log('itemssss:', data)
      setItems(data)
    }
  }

  const calculate_sum = () => {
    let sum: number = 0
    
    items?.forEach((item) => {
      sum = sum + item.total_price
    });

    return sum
  }

  const remove_all = async () => {
    return; //not tested
    //user logged in?
    const { data: { user }, error: authError, } = await supabase.auth.getUser();

    if (authError) {
      console.error('Błąd przy pobieraniu użytkownika:', authError);
      return
    }

    //does cart exist?
    const { data : removedCart, error: cartError } = await supabase.from('orders').select('id, user_id, status, total_price').eq('user_id', user?.id).limit(1)
    console.log('removedCart:', removedCart)

    //items from cart
    const {data : itemsFromCart, error : itemsFromCartError} = await supabase.from('order_items').select('id, product_id, quantity').eq('order_id', removedCart![0].id)
    
    //remove items
    const {error : removingItemsError} = await supabase.from('order_items').delete().eq('order_id', removedCart![0].id)

    //add quantities from deleted items to products
    for(let i = 0; i < itemsFromCart!.length; i++)
    {
      const {data: productFromDatabase, error: productStockQuantityError} = await supabase.from("products").select('stock_quantity').eq('id', itemsFromCart![i].product_id).limit(1)
      let newQuantity: number = productFromDatabase![0].stock_quantity + itemsFromCart![i].quantity
      const {error: addToProductQuantityError} = await supabase.from('products').update({stock_quantity: newQuantity}).eq('id', itemsFromCart![i].product_id)
    }

    //reload data
    load_cart?.(user!.id).then(() => {
      load_data?.()
    })
  }

  const add_one = async (productId: number) => {
    //...
  }

  const remove_one = async (productId: number) => {
    //...
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError, } = await supabase.auth.getUser();

      if (authError) {
        console.error('Błąd przy pobieraniu użytkownika:', authError);
      } else if (user) {
        load_cart?.(user.id).then(() => {
          load_data?.()
        })
      }
    };

    fetchUserData();
  }, []);
  
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
                <Text style={style.RemoveText} onPress={() => {remove_all()}}>Remove All</Text>
              </View>

              <View>
                {
                  items?.map((item, id) => {
                    const {data:image_url} = supabase.storage.from("product_images").getPublicUrl(item.products.image_path);
                
                    return <View style={style.ItemView} key={id}>
                      
                      <View style={style.TopRowItem}>
                        {
                          (item.products.image_path != null) ?
                          (
                            <Image style={style.ItemImage} source={{ uri: image_url.publicUrl }}></Image>
                          ) :
                          (
                            <Image style={style.ItemImage} source={require('../../assets/samples/question.png')}></Image>
                          )
                        }
                          
                        <View style={style.RowHeader}>
                          <View style={style.TopRowHeader}>
                            <Text style={style.TextDescription}>{item.products.product_name}</Text>
                            <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.products.price)}</Text>
                          </View>
                          <View style={style.BottomRowHeader}>
                            <Text style={style.BottomTextDescription}>Quantity</Text>
                            <TouchableOpacity style={style.PlusMinus} onPress={() => {add_one(item.product_id)}}>
                              <Feather name='plus' style={style.PlusMinusIcon}/>
                            </TouchableOpacity>
                            <Text style={style.BottomTextDescription}>{item.quantity}</Text>
                            <TouchableOpacity style={style.PlusMinus} onPress={() => {remove_one(item.product_id)}}>
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
                <View style={style.CheckoutButtonView}>
                  <Text style={style.CheckoutText}>Checkout</Text>
                </View>
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