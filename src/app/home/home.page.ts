import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import {
  GoogleMap,
  MapInfoWindow,
  MapGeocoder,
  MapGeocoderResponse,
} from '@angular/google-maps';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('search')
  public searchElementRef!: ElementRef;
  @ViewChild('myGoogleMap', { static: false })
  map!: google.maps.Map;
  @ViewChild(MapInfoWindow, { static: false })
  info!: MapInfoWindow;

  address = '';
  latitude!: any;
  longitude!: any;
  zoom = 9;
  maxZoom = 15;
  minZoom = 8;
  center!: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: false,
    draggable: true,
    disableDoubleClickZoom: true,
    mapTypeId: 'satellite',
  };
  markers = [] as any;
  
  currCity: any;
  cities: any[] = [];

  borderCoordinates: {lat:number,lng:number}[] = [];

  constructor(private ngZone: NgZone, private geoCoder: MapGeocoder, private   toastController: ToastController) {

    fetch("../../assets/border.json").then(res=>res.json()).then(json=>{
      this.borderCoordinates = [...json];
       //console.log("OUTPUT: ", json);
      //DO YOUR STAFF
    });


    fetch("../../assets/dat.json").then(res=>res.json()).then(json=>{
      this.cities = [...json];
      this.setQuestion();
       //console.log("OUTPUT: ", json);
      //DO YOUR STAFF
    });

  }

  ngAfterViewInit(): void {
    
    /*
    const flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map 
    });
  */
      

    // Binding autocomplete to search input control
    /*
    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement
    );
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        //get the place result
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();

        //verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }

        console.log({ place }, place.geometry.location?.lat());

        //set latitude, longitude and zoom
        this.latitude = place.geometry.location?.lat();
        this.longitude = place.geometry.location?.lng();

        // Set marker position
        this.setMarkerPosition(this.latitude, this.longitude);

        this.center = {
          lat: this.latitude,
          lng: this.longitude,
        };
      });
    });
    */
  
   
   
  }

  ngOnInit() {
    navigator.geolocation.getCurrentPosition((position) => {
      
      this.latitude = 31.406253; //position.coords.latitude ;
      this.longitude = 35.081816; //position.coords.longitude;
      this.center = {
        lat: this.latitude, //position.coords.latitude,
        lng: this.longitude //position.coords.longitude,
      };
      // Set marker position
      //this.setMarkerPosition(this.latitude, this.longitude);
    });
  
  }

  setMarkerPosition(latitude: any, longitude: any) {
    // Set marker position
    this.markers = [
      {
        position: {
          lat: latitude,
          lng: longitude,
        },
        options: {
          animation: google.maps.Animation.DROP,
          draggable: true
        }
      }
    ];
  }

  eventHandler(event: any, name: string) {
    // console.log(event, name);

    switch (name) {
      case 'mapDblclick': // Add marker on double click event
      this.setMarkerPosition(event.latLng.lat(),event.latLng.lng());
        break;

      case 'mapDragMarker':
        break;

      case 'mapDragend':
        //this.setMarkerPosition(event.latLng.lat(),event.latLng.lng());
        //this.getAddress(event.latLng.lat(), event.latLng.lng());
        break;
      
      case 'mapClick':
        console.log([event.latLng.lat(),event.latLng.lng()]);
        break;  

      case 'mapRightclick':  
      this.ngZone.run(() => {
        this.borderCoordinates.push({lat: event.latLng.lat(),lng: event.latLng.lng()});
        console.log(this.borderCoordinates);
      })
        break;
      default:
        break;
    }
  }

  getAddress(latitude: any, longitude: any) {
    this.geoCoder
      .geocode({ location: { lat: latitude, lng: longitude } })
      .subscribe((addr: MapGeocoderResponse) => {
        if (addr.status === 'OK') {
          if (addr.results[0]) {
            this.zoom = 12;
            this.address = addr.results[0].formatted_address;
          } else {
            this.address = null;
            window.alert('No results found');
          }
        } else {``
          this.address = null;
          window.alert('Geocoder failed due to: ' + addr.status);
        }
      });
  }
 

  setQuestion() {
    this.currCity = this.cities[Math.floor((Math.random() * this.cities.length))];
  }

  check() {
    
    this.markers.push({
      position: {
        lat: this.currCity.latt,
        lng: this.currCity.long
      },
      options: {
        icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png"
      }
    })
    
    this.center = {
      lat: this.currCity.latt, //position.coords.latitude,
      lng: this.currCity.long //position.coords.longitude,
    };

    this.presentToast(this.getDistanceFromLatLonInKm(this.currCity.latt,this.currCity.long,this.markers[0].position.lat,this.markers[0].position.lng).toString());
     
    setTimeout(()=> {
      this.markers=[];
      this.setQuestion();
    },2000);
    
    //this.setMarkerPosition(parseFloat(posStr.split(",")[0]), parseFloat(posStr.split(",")[1]));
  }

deg2rad(n)
{
	return n * Math.PI / 180;
}

  
  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d.toFixed(2);
  }

  async presentToast(distance: string) {
    const toast = await this.toastController.create({
      message: `${distance}km`,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }


}