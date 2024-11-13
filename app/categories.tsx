import React from 'react'
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image} from 'react-native'
import { Feather } from '@expo/vector-icons';
import { Href, Link} from 'expo-router'

const Categories = () => {
  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        <View style={style.MainContainer}>
          <Pressable style={style.BackButton}>
            <TouchableOpacity>
              <Feather name='chevron-left' style={style.BackIcon}/>
            </TouchableOpacity>
          </Pressable>

          <Text style={style.CategoriesTextLook}>Shop by categories</Text>
          <View style={style.CategoriesContainer}>
            <View style={style.CategoryView}>
              <Image source={require('../assets/category_icons/wheat.png')}></Image>
              <Link href={'/categoryItems'} style={style.CategoryLink}>Cereals</Link>
            </View>
            <View style={style.CategoryView}>
              <Image source={require('../assets/category_icons/sesame.png')}></Image>
              <Link href={'/categoryItems'} style={style.CategoryLink}>Spices</Link>
            </View>
            <View style={style.CategoryView}>
              <Image source={require('../assets/category_icons/potato.png')}></Image>
              <Link href={'/categoryItems'} style={style.CategoryLink}>Vegetables</Link>
            </View>
            <View style={style.CategoryView}>
              <Image source={require('../assets/category_icons/apple.png')}></Image>
              <Link href={'/categoryItems'} style={style.CategoryLink}>Fruits</Link>
            </View>
            <View style={style.CategoryView}>
              <Image source={require('../assets/category_icons/milk.png')}></Image>
              <Link href={'/categoryItems'} style={style.CategoryLink}>Dairy</Link>
            </View>
            <View style={style.CategoryView}>
              <Image source={require('../assets/category_icons/mushroom.png')}></Image>
              <Link href={'/categoryItems'} style={style.CategoryLink}>Mushrooms</Link>
            </View>
          </View>
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
   marginTop: 10
  },

  BackIcon:{
    fontSize: 20
  },

  CategoriesTextLook:{
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 25,
    fontWeight: '700'
  },

  CategoryView:{
    backgroundColor: '#D3D3D3',
    width: '90%',
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center'
  },

  CategoriesContainer:{
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center'
  },

  CategoryLink:{
    marginLeft: 10,
    fontWeight: '700',
    fontStyle: 'italic'
  }
})

export default Categories