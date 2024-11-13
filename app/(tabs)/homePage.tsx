import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

const Screen = () => {
  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        <View style={style.MainContainer}>
          
          <View style={style.SearchBarContainer}>
            <View style={style.SearchButton}>
              <TouchableOpacity>
                <Feather name='search' style={style.SearchIcon}/>
              </TouchableOpacity>
            </View>
            <View style={style.SearchBar}>
              <TextInput style={style.SearchInput} placeholder='Search for products...'></TextInput>
            </View>
          </View>

          <View style={style.CategoriesLinkContainer}>
            <Text style={style.TextLook}>Categories</Text>
            <Text style={style.TextLook}><Link href='../categories' style={style.LinkLook}>See All</Link></Text>
          </View>

          <ScrollView style={style.CategoriesIconsScrollContainer} horizontal={true}>
            <View style={style.CategoryIcon}>
              <Image source={require('../../assets/category_icons/wheat.png')}></Image>
              <Text style={style.TextSmaller}>Cereals</Text>
            </View>
            <View style={style.CategoryIcon}>
              <Image source={require('../../assets/category_icons/potato.png')}></Image>
              <Text style={style.TextSmaller}>Vegetables</Text>
            </View>
            <View style={style.CategoryIcon}>
              <Image source={require('../../assets/category_icons/apple.png')}></Image>
              <Text style={style.TextSmaller}>Fruits</Text>
            </View>
            <View style={style.CategoryIcon}>
              <Image source={require('../../assets/category_icons/milk.png')}></Image>
              <Text style={style.TextSmaller}>Dairy</Text>
            </View>
            <View style={style.CategoryIcon}>
              <Image source={require('../../assets/category_icons/sesame.png')}></Image>
              <Text style={style.TextSmaller}>Spices</Text>
            </View>
          </ScrollView>

          <Text style={style.TextLook}>Bestsellers</Text>

          <ScrollView style={style.BestsellersContainer} horizontal={true}>
            <View style={style.BestsellerView}>
              <Image style={style.BestsellerImage} source={require('../../assets/samples/ziemniaki.jpg')}></Image>
              <Text style={style.TextDescription}>Potatoes sack 15 kg</Text>
              <Text style={style.TextDescription}>$10.00</Text>
            </View>
            <View style={style.BestsellerView}>
              <Image style={style.BestsellerImage} source={require('../../assets/samples/jablko.jpg')}></Image>
              <Text style={style.TextDescription}>Granny Smith Apples 1 kg</Text>
              <Text style={style.TextDescription}>$3.00</Text>
            </View>
            <View style={style.BestsellerView}>
              <Image style={style.BestsellerImage} source={require('../../assets/samples/marchewki.jpg')}></Image>
              <Text style={style.TextDescription}>Carrots sack 5 kg</Text>
              <Text style={style.TextDescription}>$10.00</Text>
            </View>
          </ScrollView>

          <Text style={style.TextLook}>New in</Text>

          <ScrollView style={style.BestsellersContainer} horizontal={true}>
            <View style={style.BestsellerView}>
              <Image style={style.BestsellerImage} source={require('../../assets/samples/sliwka.jpg')}></Image>
              <Text style={style.TextDescription}>Plums</Text>
              <Text style={style.TextDescription}>$2.00</Text>
            </View>
            <View style={style.BestsellerView}>
              <Image style={style.BestsellerImage} source={require('../../assets/samples/winogrono.jpg')}></Image>
              <Text style={style.TextDescription}>Grapes</Text>
              <Text style={style.TextDescription}>$7.00</Text>
            </View>
            <View style={style.BestsellerView}>
              <Image style={style.BestsellerImage} source={require('../../assets/samples/gruszka.jpg')}></Image>
              <Text style={style.TextDescription}>Pears</Text>
              <Text style={style.TextDescription}>$10.00</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  ScrollViewLook:{
    height: '100%'
  },
  
  MainContainer:{
    flexDirection: 'column',
    flex: 1
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
    width: '95%'
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
    alignItems: 'center'
  },

  SearchIcon:{
    fontSize: 25,
    marginLeft: 10
  },

  CategoriesLinkContainer:{
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width:'100%',
    marginTop: 20
  },

  TextLook:{
    marginHorizontal: 20,
    marginVertical: 30,
    fontSize: 15,
    fontWeight: '600'
  },

  TextSmaller:{
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic'
  },

  TextDescription:{
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    padding: 2
  },

  LinkLook:{
    fontStyle: 'italic'
  },

  CategoriesIconsScrollContainer:{
    marginHorizontal: 20,
    marginVertical: 10,
    width: '100%'
  },

  CategoryIcon:{
    marginHorizontal: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 70
  },

  BestsellersContainer:{
    width: '100%',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    height: 190
  },

  BestsellerView:{
    flexDirection: 'column',
    backgroundColor: '#D3D3D3',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginHorizontal: 5
  },

  BestsellerImage:{
    maxHeight: 150,
    maxWidth: 150
  }
})

export default Screen;