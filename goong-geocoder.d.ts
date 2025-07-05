declare module '@goongmaps/goong-geocoder' {
  interface GoongGeocoderOptions {
    accessToken: string;
    mapboxgl?: any;
    marker?: boolean | { color?: string };
    placeholder?: string;
    zoom?: number;
    [key: string]: any;
  }

  class GoongGeocoder {
    constructor(options: GoongGeocoderOptions);
    on(type: string, fn: (...args: any[]) => void): this;
    off(type: string, fn: (...args: any[]) => void): this;
    addTo(container: string | HTMLElement): this;
    setInput(value: string): this;
    getResult(): any;
  }

  export default GoongGeocoder;
}
