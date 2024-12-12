import React, { useEffect, useState } from 'react'
import {TouchableOpacity, Pressable, ScrollView, StyleSheet, View, Text, Image, TextInput} from 'react-native'
import { Feather } from '@expo/vector-icons';
import { useRoute} from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { priceWithTrailingZerosAndDollar } from '../lib/utils';

const SearchResults = () => {
    const route: any = useRoute()
    const navigation = useNavigation<NativeStackNavigationProp<any>>()
    const { input } = route.params
    let MAX_RESULTS: number = 10
    const [items, setItems] = useState<any[] | null>([]);
    const [searchInput, setSearchInput] = useState(input)

    enum sortByProperty {
        default = 0,
        price = 1,
        category = 2
    }

    enum sortOrderProperty {
        ascending = 0,
        descending = 1
    }

    let sortBy: sortByProperty = sortByProperty.default
    let sortOrder: sortOrderProperty = sortOrderProperty.ascending

    const load_data = async (filter: string) => {
        const searchFilter = '%' + filter + '%'
        const { data, error } = await supabase.from('products').select('id, product_name, image_path, price, categories (name, id)').or('product_name.ilike.' + searchFilter + ', description.ilike.' + searchFilter).order('created_at', { ascending: false }).limit(MAX_RESULTS)
        setItems(data)
    }

    const onSumbitSearch = () => {
        load_data?.(searchInput)
    }

    useEffect(() => {
        load_data?.(input)
    }, []);

    const sortByPrice = () => {
        sortBy = sortByProperty.price

        if(sortOrder == sortOrderProperty.ascending) {
            sortOrder = sortOrderProperty.descending
        } else {
            sortOrder = sortOrderProperty.ascending
        }
    }

    const sortByCategory = () => {
        sortBy = sortByProperty.category

        if(sortOrder == sortOrderProperty.ascending) {
            sortOrder = sortOrderProperty.descending
        } else {
            sortOrder = sortOrderProperty.ascending
        }
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
                        <Pressable style={style.Sort1}>
                            <Text style={style.SearchItemsTextLook}>Sort by</Text>
                            <TouchableOpacity>
                                <Feather name='chevron-down' style={style.BackIcon}/>
                            </TouchableOpacity>
                        </Pressable>
                        <Pressable style={style.Sort2} onPress={() => { sortByPrice() }}>
                            <Text style={style.SortTextLook}>Price</Text>
                            <TouchableOpacity>
                                <Feather name='chevron-down' style={style.BackIcon2}/>
                            </TouchableOpacity>
                        </Pressable>
                        <Pressable style={style.Sort2} onPress={() => { sortByCategory() }}>
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
                                    <Text style={style.SearchFailedLook}>Sorry, we couldn't find any matching result for your search.</Text>
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
})

export default SearchResults
