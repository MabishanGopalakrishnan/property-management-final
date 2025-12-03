import { useEffect, useRef, useState } from "react";

export default function AddressAutocomplete({ onAddressSelect, defaultValue = "" }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    // Inject CSS to hide icons BEFORE loading script
    const style = document.createElement('style');
    style.textContent = `
      .pac-icon { display: none !important; }
      .pac-icon-marker { display: none !important; }
      .hdpi.pac-icon { display: none !important; }
      .pac-item-query { display: block !important; padding-left: 0 !important; }
      .pac-container { 
        pointer-events: auto !important; 
        z-index: 10000 !important;
        background: white;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        margin-top: 0.25rem;
      }
      .pac-item { 
        pointer-events: auto !important; 
        cursor: pointer !important;
        padding: 0.75rem 1rem !important;
        border-bottom: 1px solid #eee;
      }
      .pac-item:hover { 
        background-color: rgba(6, 182, 212, 0.1) !important; 
      }
      .pac-item span {
        padding-left: 0 !important;
      }
    `;
    document.head.appendChild(style);

    // Load Google Maps Places API script
    const loadScript = () => {
      if (window.google?.maps?.places) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.warn("Google Maps API key not found. Address autocomplete will not work.");
        return;
      }

      window.initGoogleMaps = () => {
        setScriptLoaded(true);
        delete window.initGoogleMaps;
      };

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        console.error("Failed to load Google Maps script:", error);
      };
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !inputRef.current) return;

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: ["ca", "us"] }, // Canada and US
          fields: ["address_components", "geometry", "formatted_address", "name"],
        }
      );

      // Prevent Enter key from submitting form
      inputRef.current.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });

      // Listen for place selection
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        
        if (!place.geometry) {
          console.warn("No details available for input:", place.name);
          return;
        }

      // Parse address components
      const addressComponents = place.address_components || [];
      let streetNumber = "";
      let route = "";
      let city = "";
      let province = "";
      let postalCode = "";
      let country = "";

      addressComponents.forEach((component) => {
        const types = component.types;
        
        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        }
        if (types.includes("route")) {
          route = component.long_name;
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          province = component.short_name;
        }
        if (types.includes("postal_code")) {
          postalCode = component.long_name;
        }
        if (types.includes("country")) {
          country = component.long_name;
        }
      });

      const address = `${streetNumber} ${route}`.trim();

      console.log("Parsed address data:", {
        address,
        city,
        province,
        postalCode,
        country
      });

      // Update input value to show full address
      setInputValue(place.formatted_address);

      // Call the callback with parsed address
      onAddressSelect({
        fullAddress: place.formatted_address,
        address,
        city,
        province,
        postalCode,
        country,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
    }
  }, [scriptLoaded, onAddressSelect]);

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        className="input"
        placeholder="Search for an address..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        autoComplete="off"
        style={{ width: '100%' }}
      />
      {!scriptLoaded && (
        <p className="muted" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
          Loading address search...
        </p>
      )}
    </div>
  );
}
