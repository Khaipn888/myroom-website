declare module "@goongmaps/goong-js" {
  export default goongjs;

  namespace goongjs {
    interface MapOptions {
      container: string | HTMLElement;
      style?: string;
      center?: [number, number] | { lat: number; lng: number } | { lat: string; lng: string };
      zoom?: number;
      [key: string]: any;
    }

    class Map {
      constructor(options: MapOptions);
      remove(): void;
      setCenter(center?: [number, number] | { lat: number; lng: number } | { lat: string; lng: string }): this;
      setZoom(zoom: number): this;
      getZoom(): number;
      on(event: string, handler: (event?: any) => void): this;
      off(event: string, handler?: (event?: any) => void): this;
      addControl(control: any, position?: string): this;
      flyTo(options: any): this;
      fitBounds(
        bounds: goongjs.LngLatBounds | [number, number][],
        options?: { padding?: number; maxZoom?: number }
      ): this;
    }

    class Marker {
      constructor(options?: any);
      setLngLat(lngLat: [number, number] | { lat: number; lng: number } | { lat: string; lng: string }): this;
      addTo(map: Map): this;
      remove(): this;
      getLngLat(): { lng: number; lat: number };
    }

    class Popup {
      constructor(options?: any);
      setLngLat(lngLat: [number, number]): this;
      setHTML(html: string): this;
      addTo(map: Map): this;
    }

    class NavigationControl {
      constructor(options?: any);
    }

    class LngLatBounds {
      constructor(sw: [number, number], ne?: [number, number]);
      extend(lnglat: [number, number]): this;
      getSouthWest(): { lng: number; lat: number };
      getNorthEast(): { lng: number; lat: number };
    }

    function setAccessToken(token: string): void;
    let accessToken: string;
  }

  export = goongjs;
}
