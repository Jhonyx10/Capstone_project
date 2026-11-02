import IgpitGeoFence from "../../assets/geomap/igpityoungsville.json";
import Map, { Marker, Source, Layer } from "react-map-gl";

 <Source id="igpit" type="geojson" data={IgpitGeoFence}>
     <Layer
         id="igpit-fill"
         type="fill"
         paint={{
             "fill-color": "#f97316",
             "fill-opacity": 0.25,
         }}
     />
     <Layer
         id="igpit-outline"
         type="line"
         paint={{
             "line-color": "#f97316",
             "line-width": 2,
         }}
     />
 </Source>;