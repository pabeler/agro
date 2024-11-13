import React from 'react'
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image} from 'react-native'
import { Feather } from '@expo/vector-icons';

const CategoryItems = () => {
  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        <View style={style.MainContainer}>
          <Pressable style={style.BackButton}>
            <TouchableOpacity>
              <Feather name='chevron-left' style={style.BackIcon}/>
            </TouchableOpacity>
          </Pressable>

          <Text style={style.CategoryItemsTextLook}>Fruits (240)</Text>

          <View style={style.AllItemsContainer}>
            <View style={style.ItemContainer}>
              <View style={style.Item}>
                <Image style={style.ItemImage} source={require('../assets/samples/jablko.jpg')}></Image>
                <Text style={style.TextDescription}>Apples</Text>
                <Text style={style.TextDescription}>$2.00</Text>
              </View>
            </View>
            <View style={style.ItemContainer}>
              <View style={style.Item}>
                <Image style={style.ItemImage} source={require('../assets/samples/gruszka.jpg')}></Image>
                <Text style={style.TextDescription}>Pears</Text>
                <Text style={style.TextDescription}>$3.00</Text>
              </View>
            </View>
            <View style={style.ItemContainer}>
              <View style={style.Item}>
                <Image style={style.ItemImage} source={require('../assets/samples/winogrono.jpg')}></Image>
                <Text style={style.TextDescription}>Grapes</Text>
                <Text style={style.TextDescription}>$1.50</Text>
              </View>
            </View>
            <View style={style.ItemContainer}>
              <View style={style.Item}>
                <Image style={style.ItemImage} source={require('../assets/samples/pitaja.jpg')}></Image>
                <Text style={style.TextDescription}>Dragon fruits</Text>
                <Text style={style.TextDescription}>$2.00</Text>
              </View>
            </View>
            <View style={style.ItemContainer}>
              <View style={style.Item}>
                <Image style={style.ItemImage} source={require('../assets/samples/oskomian.jpg')}></Image>
                <Text style={style.TextDescription}>Carambolas</Text>
                <Text style={style.TextDescription}>$1.00</Text>
              </View>
            </View>
            <View style={style.ItemContainer}>
              <View style={style.Item}>
                <Image style={style.ItemImage} source={require('../assets/samples/sliwka.jpg')}></Image>
                <Text style={style.TextDescription}>Plums</Text>
                <Text style={style.TextDescription}>$2.50</Text>
              </View>
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
  }
})

export default CategoryItems