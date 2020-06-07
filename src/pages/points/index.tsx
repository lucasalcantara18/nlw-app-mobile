import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon} from '@expo/vector-icons';
import Constants from 'expo-constants';
import {useNavigation, useRoute} from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import {SvgUri} from 'react-native-svg';
import api from '../../services/api';
import * as Location from 'expo-location';

// import logo from '../../assets/logo.png';
 interface Item{
     id:number;
     title:string;
     image_url:string;
 }

 interface Point{
  id:number;
  name:string;
  image:string;
  latitude:number;
  longitude:number;
}

interface Params {
  uf: string;
  city: string;
}

const Points = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [inicialPosition, setInicialPosition] = useState<[number, number]>([0,0]);



    const navigation = useNavigation();    
    const route = useRoute();

    const routeParams = route.params as Params;

    const handleNavigateBack = () => {
        navigation.goBack();
    }
    const handleNavigateToDetail = (id: number) => {
        navigation.navigate('Details', {point_id: id});
    }
    

    useEffect(() => {
       const loadPosition = async () => {
         const { status } = await Location.requestPermissionsAsync();

         if(status !== 'granted'){
           Alert.alert('Oooops', 'precisamos de sua oermissção para mostrar o mapa');
           return
         }

         const location = await Location.getCurrentPositionAsync();
         const {latitude, longitude} = location.coords;
         setInicialPosition([latitude, longitude]);
       }

       loadPosition();
    }, []);

    useEffect(() => {//pegar os itens e imagens do back end
      api.get('points', {
        params: {
          city: routeParams.city,
          uf: routeParams.uf,
          itens: selectedItems
        }
      }).then(res => {
        setPoints(res.data);
      })
    }, [selectedItems]);

    useEffect(() => {//pegar os pontos e imagens do back end
      api.get('itens').then(res => {
          console.log(res);
          setItems(res.data);
      })
    }, []);

    const handleClickIcons = (id: number) => {
      const alredySelected = selectedItems.findIndex(item => item === id);

      if(alredySelected >= 0){
          const filteredValues = selectedItems.filter(item => item !== id);
          setSelectedItems(filteredValues);
      }else{
          setSelectedItems([...selectedItems, id]);
      }
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    {inicialPosition[0] !== 0 && (
                        <MapView style={styles.map} initialRegion={{latitude: inicialPosition[0], longitude: inicialPosition[1], longitudeDelta: 0.014, latitudeDelta: 0.014}}>
                            {points.map(point => (
                                <Marker key={String(point.id)} style={styles.mapMarker} coordinate={{latitude: point.latitude, longitude: point.longitude}} onPress={() => handleNavigateToDetail(point.id)}>
                                    <View style={styles.mapMarkerContainer}>
                                        <Image source={{uri: point.image}} 
                                                style={styles.mapMarkerImage}/>
                                        <Text style={styles.mapMarkerTitle} >
                                            {point.name}
                                        </Text>
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    )}
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
                    {items.map(item => (
                        <TouchableOpacity key={String(item.id)} style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]} onPress={() => handleClickIcons(item.id)} activeOpacity={0.6}>
                          <SvgUri width={42} height={42} uri={item.image_url}></SvgUri>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

        </>
    );
    
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });

export default Points;


