import React, {useState} from 'react'
import { GoogleMap, LoadScript, Marker , InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Event } from "../../models/event";
import {
   GoogleApiWrapper,
   IMapProps,
  IMarkerProps ,
  markerEventHandler} from 'google-maps-react';


const containerStyle = {
  width: '100%',
  height: '100%'
};
 
const center = {
  lat: 31,
  lng: 35
};
// type exampleUser = {location:{lat:number,lng:number},username?:string}
// const defUsers:exampleUser[] = [
//   {
//     location:{ lat: -31.56391, lng: 147.154312 }
//   },
//   {
//     location:{ lat: -33.718234, lng: 150.363181 }
//   },
//   {
//     location:{ lat: -33.727111, lng: 150.371124 }
//   },
//   {
//     location:{ lat: -33.848588, lng: 151.209834 }
//   },
//   {
//     location:{ lat: -33.851702, lng: 151.216968 }
//   },
//   {
//     location:{ lat: -34.671264, lng: 150.863657 }
//   },
//   {
//     location:{ lat: -35.304724, lng: 148.662905 }
//   },
//   {
//     location:{ lat: -36.817685, lng: 175.699196 }
//   },
//   {
//     location:{ lat: -36.828611, lng: 175.790222 }
//   },
//   {
//     location:{ lat: -37.75, lng: 145.116667 }
//   },
//   {
//     location:{ lat: -37.759859, lng: 145.128708 }
//   },
//   {
//     location:{ lat: -37.765015, lng: 145.133858 }
//   },
//   {
//     location:{ lat: -37.770104, lng: 145.143299 }
//   },
//   {
//     location:{ lat: -37.7737, lng: 145.145187 }
//   },
//   {
//     location:{ lat: -37.774785, lng: 145.137978 }
//   },
//   {
//     location:{ lat: -37.819616, lng: 144.968119 }
//   },
//   {
//     location:{ lat: -38.330766, lng: 144.695692 }
//   },
//   {
//     location:{ lat: -39.927193, lng: 175.053218 }
//   },
//   {
//     location:{ lat: -41.330162, lng: 174.865694 }
//   },
//   {
//     location:{ lat: -42.734358, lng: 147.439506 }
//   },
//   {
//     location:{ lat: -42.734358, lng: 147.501315 }
//   },
//   {
//     location:{ lat: -42.735258, lng: 147.438 }
//   },
//   {
//     location:{ lat: -43.999792, lng: 170.463352 }
//   },
//   {
//     username:'bobby',
//     location:{
//     lat:31.1,
//     lng:35
//     }
//   },
//   {
//     username:'sally',
//     location:{
//     lat:31.2,
//     lng:35
//     }
//   },
//   {
//     username:'donnie',
//     location:{
//     lat:31.3,
//     lng:35
//     }
//   },
//   {
//     username:'peggie',
//     location:{
//     lat:31.3,
//     lng:35.002
//     }
//   },
//   {
//     username:'betty',
//     location:{
//     lat:31.4,
//     lng:35
//     }
//   },
//   {
//     username:'maggie',
//     location:{
//     lat:31.5,
//     lng:35
//     }
//   },
// ]
function Map({events}:{events:Event[]|undefined}) {
  const [map, setMap] = useState<google.maps.Map|undefined>(undefined)
  const [markers, setMarkers] = useState<(google.maps.Marker|undefined)[]>([])
  const [infos, setInfos] = useState<(google.maps.InfoWindow|undefined)[]>([])
 
  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(undefined)
  }, [])

  const markerLoad = (marker:google.maps.Marker) => {
    markers.push(marker)
  }

  const infoLoad = (info:google.maps.InfoWindow) => {
    info.open()
    infos.push(info)

  }

  const markerClick = (e:google.maps.MouseEvent) => {
    const marker:google.maps.Marker|undefined = markers.find(marker=>{
      return marker?.getPosition() == e.latLng
    })
    const i = markers.indexOf(marker)
    infos[i]?.open(map,marker)
  }

  const clusterOptions = {
    imagePath:
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
  }
  return (
    <>

    <LoadScript
      googleMapsApiKey='AIzaSyD3uRdDcPpdu9aJ5HzF27fHowG86nAQ3zo'

>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={1}
        onLoad={onLoad}
        options={{
          streetViewControl:false,
          center:center,
          mapTypeControl:false,
          fullscreenControl:false,
          scaleControl:true
        }}
        onUnmount={onUnmount}
      >
        <MarkerClusterer 
        options={clusterOptions}
        >
          {(clusterer) =>{
            //@ts-ignore
            return events?.map((event)=>{
              const {geolocation,name,date} = event
              return <Marker
                onLoad={markerLoad}
                onClick={markerClick}
                //@ts-ignore
                position={geolocation.location} 
                clickable={true}
                key={String(geolocation.location?.lat)+String(geolocation.location?.lng)}
                clusterer={clusterer}
              >
                <InfoWindow
                onLoad={infoLoad}
                >
                  <div>
                      <span>
                        name: {name}
                      </span> <br/>
                      <span>
                        time: {new Date(date).toString().slice(0,15)}
                      </span>
                  </div>
                </InfoWindow>
              </Marker>
            })}
          }
        </MarkerClusterer>
        <></>
      </GoogleMap>
    </LoadScript>
    </>
  )
}
 
export default React.memo(Map)