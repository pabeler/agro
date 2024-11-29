import React, { useEffect, useState } from 'react'
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image} from 'react-native'
import { Feather } from '@expo/vector-icons';
import { useRoute} from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { priceWithTrailingZerosAndDollar } from '../lib/utils';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const CategoryItems = () => {
  const route: any = useRoute()
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const { category } = route.params
  const [items, setItems] = useState<any[] | null>([]);
  
  const load_data = async (category: string) => {
    const { data, error } = await supabase.from('products').select('id, product_name, image_path, price, categories (id, name)').order('created_at', { ascending: false })
    
    let tempItems: any[] = []
    
    data?.forEach((element, index) => {
      if('name' in element.categories && element.categories.name != null && typeof element.categories.name == 'string') {
        if(element.categories.name.toLowerCase() == category.toLowerCase()) {
          tempItems?.push(element)
        }
      }
    })

    setItems(tempItems)
  }
  
  useEffect(() => {
    load_data?.(category)
  }, []);
  
  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        <View style={style.MainContainer}>
          <Pressable style={style.BackButton} onPress={() => { navigation.goBack() }}>
            <TouchableOpacity>
              <Feather name='chevron-left' style={style.BackIcon}/>
            </TouchableOpacity>
          </Pressable>

          <Text style={style.CategoryItemsTextLook}>{items?.length} items found in category {category}</Text>

          { 
            items!.length > 0 ?
            (
              <View style={style.AllItemsContainer}>
                {
                  items?.map((item, id) => {
                    if(item.image_path != null) {
                      const {data:image_url} = supabase.storage.from("product_images").getPublicUrl(item.image_path);
                    
                      return <View style={style.ItemContainer} key={id}>
                        <View style={style.Item}>
                          <Image style={style.ItemImage} source={{ uri: image_url.publicUrl }}></Image>
                          <Text style={style.TextDescription}>{item.product_name}</Text>
                          <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.price)}</Text>
                        </View>
                      </View>
                    } else {
                      return <View style={style.ItemContainer} key={id}>
                        <View style={style.Item}>
                          <Image style={style.ItemImage} source={require('../assets/samples/question.png')}></Image>
                          <Text style={style.TextDescription}>{item.product_name}</Text>
                          <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.price)}</Text>
                        </View>
                      </View>
                    }
                  })
                }
              </View>
            ) :
            (
              <View style={style.SearchFailedContainer}>
                <Image style={style.SearchFailedImage} source={require('../assets/samples/search.png')}></Image>
                <Text style={style.SearchFailedLook}>Sorry, we couldn't find any items in this category.</Text>
              </View>
            )
          }
        </View>
      </ScrollView>
    </View>
  )
}

const style = StyleSheet.create({
  ScrollViewLook:{
    height: '100%'
  },
  
   MainContainer:{
    flexDirection: 'column',
    flex: 1
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

  CategoryItemsTextLook:{
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 15,
    fontWeight: '700'
  },

  AllItemsContainer:{
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start'
  },

  ItemContainer:{
    width: '50%',
    alignItems: 'center'
  },

  Item:{
    paddingBottom: 15,
    margin: 8,
    backgroundColor: '#D3D3D3',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    width: 175
  },

  ItemImage:{
    height: 175,
    width: 175
  },

  TextDescription:{
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    padding: 2,
    marginHorizontal: 4
  },

  SearchFailedLook:{
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 25,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center'
  },

  SearchFailedContainer:{
    flexDirection: 'column',
    alignItems: 'center'
  },

  SearchFailedImage:{
    height: 175,
    width: 175
  }
})

export default CategoryItems