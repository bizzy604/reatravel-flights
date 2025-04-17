// Types for Flight API request structure

export interface Preference {
  CabinPreferences: {
    CabinType: Array<{
      PrefLevel: {
        PrefLevelCode: string;
      };
      OriginDestinationReferences: string[];
      Code: string;
    }>;
  };
  FarePreferences: {
    Types: {
      Type: Array<{
        Code: string;
      }>;
    };
  };
  PricingMethodPreference: {
    BestPricingOption: string;
  };
}

export interface ResponseParameters {
  ResultsLimit: {
    value: number;
  };
  SortOrder: Array<{
    Order: 'ASCENDING' | 'DESCENDING';
    Parameter: string;
  }>;
  ShopResultPreference: string;
}

export interface Traveler {
  AnonymousTraveler: Array<{
    PTC: {
      value: string;
    };
    Age: {
      Value: {
        value: number;
      };
      BirthDate: {
        value: string;
      };
    };
  }>;
}

export interface Travelers {
  Traveler: Traveler[];
}

export interface CoreQuery {
  OriginDestinations: {
    OriginDestination: Array<{
      Departure: {
        AirportCode: {
          value: string;
        };
        Date: string;
      };
      Arrival: {
        AirportCode: {
          value: string;
        };
      };
      OriginDestinationKey: string;
    }>;
  };
}

export interface FlightSearchRequest {
  Preference: Preference;
  ResponseParameters: ResponseParameters;
  Travelers: Travelers;
  CoreQuery: CoreQuery;
}

// Add response types as needed based on actual API response structure.

// --- Response Processing and Optimized Output Types ---

export interface FlightSegmentDetails {
  id: string;
  departure: { airport: string; datetime: string };
  arrival: { airport: string; datetime: string };
  airline: {
    code: string;
    name: string;
    flightNumber: string;
  };
  duration: string;
}

export interface FlightDetailsResult {
  segments: FlightSegmentDetails[];
  duration: string;
}

// Represents the final, simplified flight offer structure returned by optimizeFlightData
export interface FlightOffer {
  id: string;
  airline: {
    code: string;
    name: string;
    logo?: string; // Logo path generated
    flightNumber: string;
  };
  departure: { airport: string; datetime: string };
  arrival: { airport: string; datetime: string };
  duration: string;
  stops: number;
  stopDetails: string[]; // Array of airport codes for stops
  price: number;
  currency: string;
  seatsAvailable: number | string; // Can be number or 'N/A'
}
