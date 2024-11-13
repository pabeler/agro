import React from 'react'
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image, TextInput} from 'react-native'
import { Feather } from '@expo/vector-icons';

const SearchResults = () => {
  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        <View style={style.MainContainer}>
          <View style={style.SearchBarContainer}>
            <Pressable style={style.BackButton}>
              <TouchableOpacity>
              <Feather name='chevron-left' style={style.BackIcon}/>
              </TouchableOpacity>
            </Pressable>
            <View style={style.SearchButton}>
              <TouchableOpacity>
                <Feather name='search' style={style.SearchIcon}/>
              </TouchableOpacity>
            </View>
            <View style={style.SearchBar}>
              <TextInput style={style.SearchInput} placeholder='Search for products...'></TextInput>
            </View>
          </View>

          <View style={style.SortContainer}>
            <Pressable style={style.Sort1}>
              <Text style={style.SearchItemsTextLook}>Sort by</Text>
              <TouchableOpacity>
                <Feather name='chevron-down' style={style.BackIcon}/>
              </TouchableOpacity>
            </Pressable>
            <Pressable style={style.Sort2}>
              <Text style={style.SortTextLook}>Price</Text>
              <TouchableOpacity>
                <Feather name='chevron-down' style={style.BackIcon2}/>
              </TouchableOpacity>
            </Pressable>
            <Pressable style={style.Sort2}>
              <Text style={style.SortTextLook}>Category</Text>
              <TouchableOpacity>
                <Feather name='chevron-down' style={style.BackIcon2}/>
              </TouchableOpacity>
            </Pressable>
          </View>
          <Text style={style.SearchItemsTextLook}>4 results found</Text>

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
                <Image style={style.ItemImage} source={require('../assets/samples/jablko2.jpg')}></Image>
                <Text style={style.TextDescription}>Apples</Text>
                <Text style={style.TextDescription}>$3.00</Text>
              </View>
            </View>
            <View style={style.ItemContainer}>
              <View style={style.Item}>
                <Image style={style.ItemImage} source={require('../assets/samples/jablko3.jpg')}></Image>
                <Text style={style.TextDescription}>Apples</Text>
                <Text style={style.TextDescription}>$1.50</Text>
              </View>
            </View>
            <View style={style.ItemContainer}>
              <View style={style.Item}>
                <Image style={style.ItemImage} source={require('../assets/samples/jablko4.png')}></Image>
                <Text style={style.TextDescription}>Apples</Text>
                <Text style={style.TextDescription}>$2.00</Text>
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

  SortContainer:{
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10
  },

  Sort1:{
    backgroundColor: '#D3D3D3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: 20,
    paddingRight: 10
  },

  Sort2:{
    backgroundColor: '#3895E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: 20,
    paddingRight: 10
  },

  BackIcon:{
    fontSize: 20
  },

  BackIcon2:{
    fontSize: 20,
    color: 'white'
  },

  SearchItemsTextLook:{
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic'
  },

  SortTextLook:{
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    color: 'white'
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
    width: '85%'
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
    alignItems: 'center',
    marginLeft: 10
  },

  SearchIcon:{
    fontSize: 25,
    marginLeft: 10
  },
})

export default SearchResults