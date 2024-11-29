import React from 'react'
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image} from 'react-native'
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Categories = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  
  const navigateToCategory = (category: string) => {
    navigation.push("categoryItems", {category: category})
  }
  
  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        <View style={style.MainContainer}>
          <Pressable style={style.BackButton} onPress={() => { navigation.goBack() }}>
            <TouchableOpacity>
              <Feather name='chevron-left' style={style.BackIcon}/>
            </TouchableOpacity>
          </Pressable>

          <Text style={style.CategoriesTextLook}>Shop by categories</Text>
          <View style={style.CategoriesContainer}>
            <View style={style.CategoryViewContainer}>
              <Pressable style={style.CategoryView} onPress={() => {navigateToCategory('cereals')}}>
                <Image source={require('../assets/category_icons/wheat.png')}></Image>
                <Text style={style.CategoryLink}>Cereals</Text>
              </Pressable>
            </View>
            <View style={style.CategoryViewContainer}>
              <Pressable style={style.CategoryView} onPress={() => {navigateToCategory('spices')}}>
                <Image source={require('../assets/category_icons/sesame.png')}></Image>
                <Text style={style.CategoryLink}>Spices</Text>
              </Pressable>
            </View>
            <View style={style.CategoryViewContainer}>
              <Pressable style={style.CategoryView} onPress={() => {navigateToCategory('vegetables')}}>
                <Image source={require('../assets/category_icons/potato.png')}></Image>
                <Text style={style.CategoryLink}>Vegetables</Text>
              </Pressable>
            </View>
            <View style={style.CategoryViewContainer}>
              <Pressable style={style.CategoryView} onPress={() => {navigateToCategory('fruits')}}>
                <Image source={require('../assets/category_icons/apple.png')}></Image>
                <Text style={style.CategoryLink}>Fruits</Text>
              </Pressable>
            </View>
            <View style={style.CategoryViewContainer}>
              <Pressable style={style.CategoryView} onPress={() => {navigateToCategory('dairy')}}>
                <Image source={require('../assets/category_icons/milk.png')}></Image>
                <Text style={style.CategoryLink}>Dairy</Text>
              </Pressable>
            </View>
            <View style={style.CategoryViewContainer}>
              <Pressable style={style.CategoryView} onPress={() => {navigateToCategory('mushrooms')}}>
                <Image source={require('../assets/category_icons/mushroom.png')}></Image>
                <Text style={style.CategoryLink}>Mushrooms</Text>
              </Pressable>
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
   marginTop: 10,
   zIndex: 1.0
  },

  BackIcon:{
    fontSize: 20,
    zIndex: 0.0
  },

  CategoriesTextLook:{
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 25,
    fontWeight: '700'
  },

  CategoryView:{
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    padding: 10
  },

  CategoryViewContainer:{
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
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