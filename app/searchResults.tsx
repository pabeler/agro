import React, { useEffect, useState } from 'react'
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image, TextInput, Modal} from 'react-native'
import { Feather } from '@expo/vector-icons';
import { useRoute} from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { priceWithTrailingZerosAndDollar } from '../lib/utils';

enum sortByProperty {
  newest = 0,
  lowest_price = 1,
  highest_price = 2
}

let sortByForLoad: sortByProperty = sortByProperty.newest
let usePriceFilterForLoad: boolean = false
let lowestPriceForLoad: number | null = null
let highestPriceForLoad: number | null = null
let categoryForLoad: string = ''

const SearchResults = () => {
  const route: any = useRoute()
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const { input } = route.params
  const [items, setItems] = useState<any[] | null>([]);
  const [searchInput, setSearchInput] = useState(input)
  const [openSortModal, setOpenSortModal] = useState(false)
  const [openCategoryModal, setOpenCategoryModal] = useState(false)
  const [openPriceRangeModal, setOpenPriceRangeModal] = useState(false)
  const [highestPriceInput, setHighestPriceInput] = useState('')
  const [lowestPriceInput, setLowestPriceInput] = useState('')
  const [sortBy, setSortBy] = useState(sortByProperty.newest)
  const [usePriceFilter, setUsePriceFilter] = useState(false)
  const [lowestPrice, setLowestPrice] = useState<null | number>(null)
  const [highestPrice, setHighestPrice] = useState<null | number>(null)
  const [category, setCategory] = useState<string>('')
  const MAX_RESULTS: number = 30

  const load_data = async (filter: string) => {
    console.log('sort', sortByForLoad, 'usePriceFilter', usePriceFilterForLoad, 'lowest', lowestPriceForLoad, 'highest', highestPriceForLoad, 'category', categoryForLoad, '|')
    
    const searchFilter = '%' + filter + '%'
    const categoryFilter = '%' + categoryForLoad + '%'

    let sortByFilter: string = ''
    let sortByOrder: boolean = false

    switch(sortByForLoad as sortByProperty) {
      case sortByProperty.newest: {
        sortByFilter = 'created_at'
        sortByOrder = false
        break;
      }
      case sortByProperty.lowest_price: {
        sortByFilter = 'price'
        sortByOrder = true
        break;
      }
      case sortByProperty.highest_price: {
        sortByFilter = 'price'
        sortByOrder = false
        break;
      }
    }
    
    if(usePriceFilterForLoad == false) {
      const { data, error } = await supabase.from('products')
      .select('id, product_name, image_path, price, categories (name, id)')
      .or('product_name.ilike.' + searchFilter + ', description.ilike.' + searchFilter)
      .ilike('categories.name', categoryFilter)
      .order(sortByFilter, { ascending: sortByOrder })
      .limit(MAX_RESULTS)

      let tempItems: any[] = []

      if(category != '') {
        data?.forEach((element, index) => {
          if(element.categories != null)
          {
            tempItems.push(element)
          }
        })
        
        setItems(tempItems)
      } else {
        setItems(data)
      }
    }
    else {
      const { data, error } = await supabase.from('products')
      .select('id, product_name, image_path, price, categories (name, id)')
      .or('product_name.ilike.' + searchFilter + ', description.ilike.' + searchFilter)
      .ilike('categories.name', categoryFilter)
      .gte('price', lowestPriceForLoad)
      .lte('price', highestPriceForLoad)
      .order(sortByFilter, { ascending: sortByOrder })
      .limit(MAX_RESULTS)

      let tempItems: any[] = []
    
      if(category != '') {
        data?.forEach((element, index) => {
          if(element.categories != null)
          {
            tempItems.push(element)
          }
        })
        
        setItems(tempItems)
      } else {
        setItems(data)
      }
    }
  }

  const onSumbitSearch = () => {
    load_data?.(searchInput)
  }
  
  useEffect(() => {
    load_data?.(input)
  }, []);

  const onSetSortOrder = (order: sortByProperty) => {
    setSortBy(order)
    sortByForLoad = order
    load_data?.(searchInput)
  }

  const onSetCategory = (categoryArg: string) => {
    setCategory(categoryArg)
    categoryForLoad = categoryArg
    load_data?.(searchInput)
  }

  const onSetPriceRange = (lowestPriceArg: number | null, highestPriceArg: number | null) => {
    if(lowestPriceArg != null && highestPriceArg != null) {
      setUsePriceFilter(true)
      setLowestPrice(lowestPriceArg)
      setHighestPrice(highestPriceArg)
      usePriceFilterForLoad = true
      lowestPriceForLoad = lowestPriceArg
      highestPriceForLoad = highestPriceArg
    } else {
      setUsePriceFilter(false)
      setLowestPriceInput('')
      setHighestPriceInput('')

      usePriceFilterForLoad = false
    }

    load_data?.(searchInput)
  }

  const processPriceRangeInput = (lowestPriceAsString: string, highestPriceAsString: string) => {
    let lowestPriceAsNumber: number = Number(lowestPriceAsString)
    let highestPriceAsNumber: number = Number(highestPriceAsString)

    if(lowestPriceAsString == '' || highestPriceAsString == '') {
      onSetPriceRange(null, null)
      return
    }

    if((isNaN(lowestPriceAsNumber) || isNaN(highestPriceAsNumber))) {
      return
    }

    if(lowestPriceAsNumber < 0 || highestPriceAsNumber < 0) {
      return
    }

    onSetPriceRange(lowestPriceAsNumber, highestPriceAsNumber)
  }

  function renderSortModal() {
    return(
      <Modal visible={openSortModal} animationType='slide' transparent={true}>
        <View style={style.Modal}>
          <View style={style.ModalContainer}>
            <View style={style.ModalHeaderContainer}>
              <Text style={style.ClearText} onPress={() => {onSetSortOrder(sortByProperty.newest)}}>Clear</Text>
              <Text style={style.ModelTitleText}>Sort by</Text>
              <TouchableOpacity onPress={() => { setOpenSortModal(false) }}>
                  <Feather name='x' style={style.CloseIcon}/>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={sortBy==sortByProperty.newest ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetSortOrder(sortByProperty.newest)}}>
              <Text style={sortBy==sortByProperty.newest ? style.OptionsTextActive : style.OptionsText}>Newest</Text>
              <TouchableOpacity>
                  <Feather name='check' style={sortBy==sortByProperty.newest ? style.OkIconActive : style.OkIcon}/>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={sortBy==sortByProperty.lowest_price ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetSortOrder(sortByProperty.lowest_price)}}>
              <Text style={sortBy==sortByProperty.lowest_price ? style.OptionsTextActive : style.OptionsText}>Ascending price</Text>
              <TouchableOpacity>
                  <Feather name='check' style={sortBy==sortByProperty.lowest_price ? style.OkIconActive : style.OkIcon}/>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={sortBy==sortByProperty.highest_price ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetSortOrder(sortByProperty.highest_price)}}>
              <Text style={sortBy==sortByProperty.highest_price ? style.OptionsTextActive : style.OptionsText}>Descending price</Text>
              <TouchableOpacity>
                  <Feather name='check' style={sortBy==sortByProperty.highest_price ? style.OkIconActive : style.OkIcon}/>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  function renderCategoryModal() {
    return(
      <Modal visible={openCategoryModal} animationType='slide' transparent={true}>
        <View style={style.Modal}>
          <View style={style.ModalContainer}>
            <View style={style.ModalHeaderContainer}>
              <Text style={style.ClearText} onPress={() => {onSetCategory('')}}>Clear</Text>
              <Text style={style.ModelTitleText}>Category</Text>
              <TouchableOpacity onPress={() => { setOpenCategoryModal(false) }}>
                  <Feather name='x' style={style.CloseIcon}/>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={category=='cereals' ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetCategory('cereals')}}>
              <Text style={category=='cereals' ? style.OptionsTextActive : style.OptionsText}>Cereals</Text>
              <TouchableOpacity style={category=='cereals' ? style.OkIconActive : style.OkIcon}>
                <Feather name='check'/>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={category=='spices' ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetCategory('spices')}}>
              <Text style={category=='spices' ? style.OptionsTextActive : style.OptionsText}>Spices</Text>
              <TouchableOpacity style={category=='spices' ? style.OkIconActive : style.OkIcon}>
                <Feather name='check'/>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={category=='vegetables' ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetCategory('vegetables')}}>
              <Text style={category=='vegetables' ? style.OptionsTextActive : style.OptionsText}>Vegetables</Text>
              <TouchableOpacity style={category=='vegetables' ? style.OkIconActive : style.OkIcon}>
                <Feather name='check'/>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={category=='fruits' ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetCategory('fruits')}}>
              <Text style={category=='fruits' ? style.OptionsTextActive : style.OptionsText}>Fruits</Text>
              <TouchableOpacity style={category=='fruits' ? style.OkIconActive : style.OkIcon}>
                <Feather name='check'/>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={category=='dairy' ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetCategory('dairy')}}>
              <Text style={category=='dairy' ? style.OptionsTextActive : style.OptionsText}>Dairy</Text>
              <TouchableOpacity style={category=='dairy' ? style.OkIconActive : style.OkIcon}>
                <Feather name='check'/>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={category=='mushrooms' ? style.OptionsContainerActive : style.OptionsContainer} onPress={() => {onSetCategory('mushrooms')}}>
              <Text style={category=='mushrooms' ? style.OptionsTextActive : style.OptionsText}>Mushrooms</Text>
              <TouchableOpacity style={category=='mushrooms' ? style.OkIconActive : style.OkIcon}>
                <Feather name='check'/>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  function renderPriceRangeModal() {
    return(
      <Modal visible={openPriceRangeModal} animationType='slide' transparent={true}>
        <View style={style.Modal}>
          <View style={style.ModalContainer}>
            <View style={style.ModalHeaderContainer}>
              <Text style={style.ClearText} onPress={() => {onSetPriceRange(null, null)}}>Clear</Text>
              <Text style={style.ModelTitleText}>Set price range</Text>
              <TouchableOpacity onPress={() => { setOpenPriceRangeModal(false) }}>
                  <Feather name='x' style={style.CloseIcon}/>
              </TouchableOpacity>
            </View>
            <View>
              <TextInput style={style.PriceRangeInput} keyboardType='numeric' placeholder='Set minimal price' value={lowestPriceInput} onChangeText={(value) => setLowestPriceInput(value)}></TextInput>
            </View>
            <View>
              <TextInput style={style.PriceRangeInput} keyboardType='numeric' placeholder='Set maximal price' value={highestPriceInput} onChangeText={(value) => setHighestPriceInput(value)}></TextInput>
            </View>
            <View>
              <TouchableOpacity style={style.PriceButton} onPress={() => {processPriceRangeInput(lowestPriceInput, highestPriceInput)}}>
                <Text style={style.PriceButtonText}>Confirm price range!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <View>
      <ScrollView style={style.ScrollViewLook}>
        <View style={style.MainContainer}>
          <View style={style.SearchBarContainer}>
            <Pressable style={style.BackButton} onPress={() => { navigation.goBack() }}>
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
              <TextInput style={style.SearchInput}
              placeholder='Search for products...'
              value={searchInput}
              onChangeText={(value) => setSearchInput(value)}
              onSubmitEditing={onSumbitSearch}></TextInput>
            </View>
          </View>

          <View style={style.SortContainer}>
            <Pressable style={style.Sort1} onPress={() => {setOpenSortModal(true)}}>
              <Text style={style.SearchItemsTextLook}>Sort by</Text>
              <TouchableOpacity>
                <Feather name='chevron-down' style={style.BackIcon}/>
              </TouchableOpacity>
            </Pressable>
            <Pressable style={style.Sort2} onPress={() => {setOpenPriceRangeModal(true)}}>
              <Text style={style.SortTextLook}>Price</Text>
              <TouchableOpacity>
                <Feather name='chevron-down' style={style.BackIcon2}/>
              </TouchableOpacity>
            </Pressable>
            <Pressable style={style.Sort2} onPress={() => {setOpenCategoryModal(true)}}>
              <Text style={style.SortTextLook}>Category</Text>
              <TouchableOpacity>
                <Feather name='chevron-down' style={style.BackIcon2}/>
              </TouchableOpacity>
            </Pressable>
          </View>
          <Text style={style.SearchItemsTextLook}>{items?.length} results found</Text>

          { 
            items!.length > 0 ?
            (
              <View style={style.AllItemsContainer}>
                {
                  items?.map((item, id) => {
                    const {data:image_url} = supabase.storage.from("product_images").getPublicUrl(item.image_path);
                    
                    return <View style={style.ItemContainer} key={id}>
                      <TouchableOpacity style={style.Item} onPress={() => 
                        navigation.navigate("productDetails", {
                          productId: item.id,
                          productName: item.product_name,
                          productPrice: item.price,
                          productImage: item.image_path ? image_url.publicUrl : null,
                        })}>

                        {
                          (item.image_path != null) ?
                          (
                            <Image style={style.ItemImage} source={{ uri: image_url.publicUrl }}></Image>
                          ) :
                          (
                            <Image style={style.ItemImage} source={require('../assets/samples/question.png')}></Image>
                          )
                        }
                        
                        <Text style={style.TextDescription}>{item.product_name}</Text>
                        <Text style={style.TextDescription}>{priceWithTrailingZerosAndDollar(item.price)}</Text>
                      </TouchableOpacity>
                    </View>
                  })
                }
              </View>
            ) :
            (
              <View style={style.SearchFailedContainer}>
                <Image style={style.SearchFailedImage} source={require('../assets/samples/search.png')}></Image>
                <Text style={style.SearchFailedLook}>Sorry, we couldn't find any matching result for your search.</Text>
              </View>
            )
          }
        </View>
      </ScrollView>
      { renderSortModal() }
      { renderPriceRangeModal() }
      { renderCategoryModal() }
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
    fontSize: 20,
    zIndex: 0.0
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

  SearchFailedLook:{
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 25,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center'
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

  SearchFailedContainer:{
    flexDirection: 'column',
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

  SearchFailedImage:{
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

  Modal:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },

  ModalContainer:{
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 30,
    alignItems: 'center'
  },

  ModalHeaderContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  
  CloseIcon:{
    fontSize: 25,
    padding: 20
  },

  ClearText:{
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '600',
    padding: 20
  },

  ModelTitleText:{
    fontSize: 28,
    fontWeight: '600',
    padding: 20
  },

  OptionsContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#bfbfbf',
    borderRadius: 30,
    marginBottom: 10
  },

  OptionsContainerActive:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#8b61ff',
    borderRadius: 30,
    marginBottom: 10
  },

  OptionsText:{
    padding: 20,
    fontSize: 15,
    color: 'black'
  },

  OptionsTextActive:{
    padding: 20,
    fontSize: 15,
    color: 'white'
  },

  OkIcon:{
    padding: 20,
    fontSize: 25,
    color: '#bfbfbf'
  },

  OkIconActive:{
    padding: 20,
    fontSize: 25,
    color: 'white'
  },

  PriceRangeInput:{
    fontSize: 22,
    backgroundColor: '#d3d3d3',
    color: 'black',
    margin: 5,
    padding: 10,
    borderRadius: 10
  },

  PriceButton:{
    backgroundColor: '#8b61ff',
    margin: 5,
    padding: 10,
    borderRadius: 10
  },

  PriceButtonText:{
    fontSize: 20,
    color: 'white'
  }
})

export default SearchResults