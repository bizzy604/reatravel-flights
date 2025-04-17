import axios from "axios"
import { logger } from "./logger"
import type { FlightSearchRequest, FlightOffer, FlightSegmentDetails, FlightDetailsResult } from '@/types/flight-api';

// --- Verteil API Types and Token Management ---

export interface VerteilToken {
  access_token: string;
  token_type: string;
  expires_in: number; // in seconds
  scope?: string;
}

let verteilToken: VerteilToken | null = null;
let verteilTokenExpiry: number | null = null; // In-memory expiry for server-side
const verteilTokenExpiryKey = 'verteilTokenExpiry';
const verteilTokenKey = 'verteilToken';

/**
 * Fetch a new Verteil API token using Basic Auth.
 */
async function fetchVerteilToken(): Promise<VerteilToken> {
  const username = 'reatravel_apitestuser';
  const password = 'UZrNcyxpIFn2TOdiU5uc9kZrqJwxU44KdlyFBpiDOaaNom1xSySEtQmRq9IcDq3c';
  const basicAuth = btoa(`${username}:${password}`);
  const url = 'https://api.stage.verteil.com/oauth2/token?grant_type=client_credentials&scope=api';

  const headers = {
    'Authorization': `Basic ${basicAuth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'REATravel/1.0',
  };

  try {
    const response = await axios.post(url, null, { headers });
    return response.data as VerteilToken;
  } catch (error) {
    logger.error('Error fetching Verteil token', { error });
    throw error;
  }
}

/**
 * Get a valid Verteil token, refreshing if expired.
 */
export async function getVerteilToken(): Promise<VerteilToken> {
  // Check in-memory first
  if (verteilToken && verteilTokenExpiry && verteilTokenExpiry > Date.now()) {
    return verteilToken;
  }

  // Check sessionStorage (only if in browser)
  if (typeof window !== 'undefined') {
    const storedToken = sessionStorage.getItem(verteilTokenKey);
    const storedExpiry = sessionStorage.getItem(verteilTokenExpiryKey);
    if (storedToken && storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      if (expiry > Date.now()) {
        const parsedToken = JSON.parse(storedToken) as VerteilToken;
        // Update in-memory cache as well
        verteilToken = parsedToken;
        verteilTokenExpiry = expiry;
        return parsedToken;
      }
    }
  }

  // Fetch new token
  const newToken = await fetchVerteilToken();
  const newExpiry = Date.now() + (newToken.expires_in - 60) * 1000; // Calculate expiry (60s buffer)

  // Update in-memory cache
  verteilToken = newToken;
  verteilTokenExpiry = newExpiry; 
  // Update sessionStorage (only if in browser)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(verteilTokenKey, JSON.stringify(newToken));
    sessionStorage.setItem(verteilTokenExpiryKey, newExpiry.toString());
  }

  return newToken;
}

/**
 * Call Verteil AirShopping API with all required headers.
 * @param payload The AirShopping request payload
 * @returns API response
 */
export async function callVerteilAirShopping(payload: any) {
  const token = await getVerteilToken();
  const url = 'https://api.stage.verteil.com/entrygate/rest/request:airShopping'; // endpoint uses lowercase 'a'
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.access_token}`,
    'User-Agent': 'Chrome/1.0',
    'Accept-Encoding': 'gzip',
    'ThirdpartyId': 'LHG',
    'OfficeId': 'OFF3746', // Capital O per Swagger
    'service': 'AirShopping', // lowercase key, capitalized value per Swagger
    // 'resource': '...', // Only include if needed for special flows
  };
  try {
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    logger.error('Error in Verteil AirShopping call', { error });
    throw error;
  }
}

// --- Helper Functions (Revised - Part 1) ---

/**
 * Finds an item in a DataList array by its key.
 * Adds more robust logging.
 */
const findInDataList = (key: string, list: any[], idField: string): any | null => {
  if (!list || !Array.isArray(list)) {
    logger.warn(`List for field ${idField} is missing or not an array`);
    return null;
  }
  const item = list.find((item) => item && item[idField] === key);
  if (!item) {
    // Reduce log noise: Log only if explicitly debugging deeper
     logger.debug(`Item with ${idField}='${key}' not found in list.`);
  }
  return item || null;
};

/**
 * Extracts segment details from FlightSegmentList based on SegmentKey.
 * Assumes structure based on common patterns. Adds robust checks.
 */
const getSegmentDetails = (segmentKey: string, dataLists: any): FlightSegmentDetails | null => {
  const segment = findInDataList(segmentKey, dataLists?.FlightSegmentList, "SegmentKey");
  if (!segment) {
    logger.warn(`Segment not found for key: ${segmentKey}`);
    return null;
  }

  // Extract details, providing fallbacks
  const departureAirport = segment.Departure?.AirportCode;
  const departureDateTime = segment.Departure?.Date;
  const arrivalAirport = segment.Arrival?.AirportCode;
  const arrivalDateTime = segment.Arrival?.Date;

  // Use MarketingCarrierInfo based on api-response.md structure
  const marketingCarrier = segment.MarketingCarrierInfo; // Corrected path
  const airlineCode = marketingCarrier?.CarrierDesigCode; // Using CarrierDesigCode
  const flightNumber = marketingCarrier?.MarketingCarrierFlightNumber?._ || '0000'; // Using MarketingCarrierFlightNumber

  // Attempt to find airline name from AirlineList
  const airlineName = findInDataList(airlineCode, dataLists?.AirlineList, "AirlineID")?.Name?._ || 'Unknown Airline';

  const airlineInfo = {
    code: airlineCode,
    name: airlineName,
    flightNumber: flightNumber, // Added flight number
  };

  const duration = segment.FlightDetail?.FlightDuration?._ || 'N/A'; // Example path, adjust if needed

  // Ensure the returned object matches FlightSegmentDetails interface
  const segmentDetails: FlightSegmentDetails = {
    id: segmentKey,
    departure: {
      airport: departureAirport,
      datetime: departureDateTime,
    },
    arrival: {
      airport: arrivalAirport,
      datetime: arrivalDateTime,
    },
    airline: airlineInfo, // airlineInfo now includes flightNumber
    duration: duration,
  };

  return segmentDetails;
};

/**
 * Resolves flight details (segments, duration) using references found within an offer.
 * Handles multiple possible reference structures in the API response.
 */
const resolveFlightDetailsFromRefs = (
    references: any,  // Can be any structure that might contain references
    dataLists: any   // The DataLists section containing all flight data
): FlightDetailsResult | null => {
    logger.debug("Starting flight details resolution with references", {
        referencesType: typeof references,
        isArray: Array.isArray(references),
        hasDataLists: !!dataLists,
        dataListsKeys: dataLists ? Object.keys(dataLists) : []
    });
    
    // Log some samples from the DataLists to understand their structure
    if (dataLists) {
        // Sample of FlightList
        const flightListSample = dataLists.FlightList?.Flight?.[0];
        if (flightListSample) {
            logger.debug('FLIGHT LIST SAMPLE', {
                flightSample: JSON.stringify(flightListSample).substring(0, 1000) + '...'
            });
        }
        
        // Sample of FlightSegmentList
        const segmentListSample = dataLists.FlightSegmentList?.FlightSegment?.[0];
        if (segmentListSample) {
            logger.debug('SEGMENT LIST SAMPLE', {
                segmentSample: JSON.stringify(segmentListSample).substring(0, 1000) + '...'
            });
        }

        // Check how to access the OriginDestinationList
        const odListSample = dataLists.OriginDestinationList?.OriginDestination?.[0];
        if (odListSample) {
            logger.debug('ORIGIN DESTINATION LIST SAMPLE', {
                odSample: JSON.stringify(odListSample).substring(0, 1000) + '...'
            });
        }
    }

    let segmentKeys: string[] = [];
    let journeyDuration = 'N/A';
    let flightKey: string | null = null;

    // Multiple possible reference structures need different handling
    
    // APPROACH 1: If references is an array of ref objects with FlightKey or SegmentKey
    if (Array.isArray(references)) {
        logger.debug('Processing references array', { length: references.length });
        
        // First try to find direct flight references
        for (const ref of references) {
            // Check different possible formats of flight references
            if (ref.FlightKey) {
                flightKey = ref.FlightKey;
                logger.debug('Found direct FlightKey reference', { flightKey });
                break;
            } else if (ref.value && ref.type === 'Flight') {
                flightKey = ref.value;
                logger.debug('Found typed Flight reference', { flightKey });
                break;
            } else if (ref.ref && ref.refType === 'Flight') {
                flightKey = ref.ref;
                logger.debug('Found refType Flight reference', { flightKey });
                break;
            }
        }
        
        // If no direct flight keys, check for segment references
        if (!flightKey && segmentKeys.length === 0) {
            for (const ref of references) {
                if (ref.SegmentKey) {
                    segmentKeys.push(ref.SegmentKey);
                    logger.debug('Found direct SegmentKey reference', { segmentKey: ref.SegmentKey });
                } else if (ref.value && ref.type === 'Segment') {
                    segmentKeys.push(ref.value);
                    logger.debug('Found typed Segment reference', { segmentKey: ref.value });
                } else if (ref.ref && ref.refType === 'Segment') {
                    segmentKeys.push(ref.ref);
                    logger.debug('Found refType Segment reference', { segmentKey: ref.ref });
                }
            }
        }
    }
    
    // APPROACH 2: Try standard path with OriginDestinationReferences
    if (!flightKey && segmentKeys.length === 0 && references?.OriginDestinationReferences) {
        const odRef = references.OriginDestinationReferences[0];
        logger.debug('Trying OriginDestinationReferences path', { odRef });
        
        if (odRef) {
            const originDestination = findInDataList(odRef, dataLists?.OriginDestinationList, "OriginDestinationKey");
            if (originDestination) {
                // Extract flight references
                const flightRefs = originDestination.FlightReferences?._?.split(' ') || [];
                logger.debug('Found flight keys in OD', { odRef, flightRefs });
                
                if (flightRefs.length > 0) {
                    journeyDuration = originDestination.FlightDuration?.Value || 'N/A';
                    flightKey = flightRefs[0]; // Use first flight reference
                } else if (originDestination.SegmentReferences?._) {
                    // Direct segment references in OD
                    segmentKeys = originDestination.SegmentReferences._.split(' ') || [];
                    logger.debug('Found direct segment references in OD', { segmentKeys });
                }
            }
        }
    }
    
    // APPROACH 3: Try special reference structures like PricedOffer.Associations
    if (!flightKey && segmentKeys.length === 0 && references?.PricedOffer?.Associations) {
        logger.debug('Trying PricedOffer.Associations path');
        
        // The associations array might contain different structures
        if (Array.isArray(references.PricedOffer.Associations)) {
            for (const association of references.PricedOffer.Associations) {
                // Check for ApplicableFlight property
                if (association.ApplicableFlight) {
                    logger.debug('Found ApplicableFlight in association');
                    const flight = association.ApplicableFlight;
                    
                    // Check for FlightSegmentReference array (this seems to be the correct path based on logs)
                    if (flight.FlightSegmentReference && Array.isArray(flight.FlightSegmentReference)) {
                        // Extract segment refs from each FlightSegmentReference object
                        for (const segRef of flight.FlightSegmentReference) {
                            if (segRef.ref) {
                                segmentKeys.push(segRef.ref);
                                logger.debug('Found segment ref in FlightSegmentReference', { segRef: segRef.ref });
                            }
                        }
                        
                        // Also store the flight reference if available
                        if (flight.FlightReferences?.value && Array.isArray(flight.FlightReferences.value)) {
                            flightKey = flight.FlightReferences.value[0];
                            logger.debug('Found flight reference in ApplicableFlight', { flightKey });
                        }
                        
                        // If we found segment keys, we can break out of the loop
                        if (segmentKeys.length > 0) {
                            logger.debug('Successfully extracted segment keys', { count: segmentKeys.length });
                            break;
                        }
                    }
                    // Fallback to other formats
                    else if (flight.FlightKey) {
                        flightKey = flight.FlightKey;
                        logger.debug('Found FlightKey in ApplicableFlight', { flightKey });
                        break;
                    } else if (flight.SegmentReferences?._) {
                        segmentKeys = flight.SegmentReferences._.split(' ') || [];
                        logger.debug('Found SegmentReferences in ApplicableFlight', { segmentKeys });
                        break;
                    }
                }
                
                // Check for PriceClass, which might contain ApplicableFlight
                if (association.PriceClass && association.PriceClass.refs) {
                    logger.debug('Found PriceClass with refs in association');
                    // Direct refs in PriceClass
                    const priceClassRefs = association.PriceClass.refs;
                    if (Array.isArray(priceClassRefs)) {
                        for (const ref of priceClassRefs) {
                            // Check for FlightRef type
                            if (ref.type === 'Flight' && ref.value) {
                                flightKey = ref.value;
                                logger.debug('Found Flight ref in PriceClass', { flightKey });
                                break;
                            } 
                            // Check for direct SegmentRef
                            else if (ref.type === 'Segment' && ref.value) {
                                segmentKeys.push(ref.value);
                                logger.debug('Found Segment ref in PriceClass', { segmentKey: ref.value });
                            }
                        }
                    }
                }
                
                // Check if we already found what we needed
                if (flightKey || segmentKeys.length > 0) break;
            }
        } 
        // Handle if Associations is a direct object
        else if (references.PricedOffer.Associations.ApplicableFlight) {
            const flight = references.PricedOffer.Associations.ApplicableFlight;
            
            if (flight.FlightKey) {
                flightKey = flight.FlightKey;
                logger.debug('Found FlightKey in PricedOffer.Associations.ApplicableFlight', { flightKey });
            } else if (flight.SegmentReferences?._) {
                segmentKeys = flight.SegmentReferences._.split(' ') || [];
                logger.debug('Found SegmentReferences in PricedOffer.Associations.ApplicableFlight', { segmentKeys });
            }
        }
    }

    // If we found a flight key but no segment keys, try to get the segments from the flight
    if (flightKey && segmentKeys.length === 0) {
        logger.debug('Found flight key but no segments yet, looking up flight details', { flightKey });
        const flight = findInDataList(flightKey, dataLists?.FlightList, "FlightKey");
        if (flight) {
            // Extract segment references from the flight
            const segRefs = flight.SegmentReferences?._?.split(' ') || [];
            if (segRefs.length > 0) {
                segmentKeys = segRefs;
                logger.debug('Found segment keys from flight', { flightKey, segmentKeys });
                
                // Extract journey duration if not already set
                if (journeyDuration === 'N/A') {
                    journeyDuration = flight.Journey?.Time?._ || flight.Journey?.Duration || 'N/A';
                }
            } else {
                logger.warn('Flight found but has no segment references', { flightKey });
            }
        } else {
            logger.warn('Flight key could not be found in FlightList', { flightKey });
        }
    }

    // Check if we have any segment keys at this point
    if (segmentKeys.length === 0) {
        logger.warn('Failed to extract any segment keys from references');
        return null; // Cannot resolve details
    }

    // --- Process Derived Segment Keys ---
    logger.debug('Processing segment keys', { count: segmentKeys.length, keys: segmentKeys });

    // Remove duplicate segment keys if any were added from multiple paths (unlikely but possible)
    const uniqueSegmentKeys = [...new Set(segmentKeys)];

    const segments = uniqueSegmentKeys
        .map(key => getSegmentDetails(key, dataLists))
        .filter((segment): segment is FlightSegmentDetails => segment !== null); // Type guard filters nulls

    // Log if some segments failed to resolve
    if (segments.length !== uniqueSegmentKeys.length) {
        logger.warn("Could not resolve details for all derived segment keys", {
            expectedKeys: uniqueSegmentKeys,
             resolvedCount: segments.length,
             resolvedKeys: segments.map(s => s.id),
             missingKeys: uniqueSegmentKeys.filter(k => !segments.some(s => s.id === k))
        });
    }

    // If NO segments could be resolved at all, consider it a failure
    if (segments.length === 0) {
        logger.error("Failed to resolve any segment details from derived keys.", { segmentKeys: uniqueSegmentKeys });
        return null;
    }

    // Return the resolved segments and the journey duration found
    return {
        segments: segments,
        // Duration might need parsing later (e.g., 'PT2H30M' -> '2h 30m')
        duration: journeyDuration,
    };
}; // End resolveFlightDetailsFromRefs

// --- Main Data Optimization Function --- //

/**
 * Optimize flight data to reduce memory usage
 * @param rawData - The raw API response data
 * @returns The optimized flight data
 */
export function optimizeFlightData(rawData: any): { flights: FlightOffer[]; meta: Record<string, any> } {
    logger.info("Starting flight data optimization...");
    
    // Check for both possible response structures
    // 1. Direct root level structure (as seen in logs)
    // 2. Nested under ResponseBody.OTA_AirOfferPriceRS (as in API docs)
    const dataLists = rawData?.DataLists || rawData?.ResponseBody?.OTA_AirOfferPriceRS?.DataLists;
    const offersGroup = rawData?.OffersGroup || rawData?.ResponseBody?.OTA_AirOfferPriceRS?.OffersGroup;
    
    // Log available data structure for debugging
    logger.debug("Data structure keys:", Object.keys(rawData || {}));
    
    if (dataLists) {
        logger.debug("DataLists found:", Object.keys(dataLists));
    }
    
    // Check if we have the required data structures
    if (!offersGroup || !offersGroup.AirlineOffers || !Array.isArray(offersGroup.AirlineOffers) || !dataLists) {
        logger.warn("No AirlineOffers or DataLists found, or invalid structure.", {
            hasOffersGroup: !!offersGroup,
            hasAirlineOffers: !!offersGroup?.AirlineOffers,
            hasDataLists: !!dataLists,
        });
        // Return fallback data immediately if DataLists is missing
        return {
            flights: [], // Empty array as we cannot process anything
            meta: {
                total: 0,
                currency: 'USD',
                isFallbackData: true,
                error: "Missing essential DataLists in API response."
            }
        };
    }
    
    // Navigate correctly to the AirlineOffers array
    const airlineOffers = offersGroup.AirlineOffers;
    
    if (airlineOffers.length === 0) {
        logger.info("No AirlineOffers found in OffersGroup, returning empty result set.");
        return {
            flights: [],
            meta: {
                total: 0,
                currency: 'USD',
                isFallbackData: false, // Not fallback, just empty
                message: "No flight offers found."
            }
        };
    }
    
    // Log the number of airline offers found
    logger.debug("Airline offers found:", airlineOffers.length);
    logger.debug(`Found ${airlineOffers.length} AirlineOffers groups.`);

    // Try to extract currency from different possible locations in the API response
    let currency = 'USD'; // Default currency
    
    // Check first airline offer for currency information
    if (airlineOffers[0]?.AirlineOffer?.[0]?.TotalPrice?.SimpleCurrencyPrice?.Code) {
        currency = airlineOffers[0].AirlineOffer[0].TotalPrice.SimpleCurrencyPrice.Code;
        logger.debug(`Found currency from first offer: ${currency}`);
    } 
    // Try metadata path as fallback
    else if (rawData?.Metadata?.Other?.CurrencyMetadatas?.CurrencyMetadata?.[0]?.$.MetadataKey) {
        currency = rawData.Metadata.Other.CurrencyMetadatas.CurrencyMetadata[0].$.MetadataKey;
        logger.debug(`Found currency from metadata: ${currency}`);
    }
    // Try nested path as another fallback
    else if (rawData?.ResponseBody?.OTA_AirOfferPriceRS?.Metadata?.Other?.CurrencyMetadatas?.CurrencyMetadata?.[0]?.$.MetadataKey) {
        currency = rawData.ResponseBody.OTA_AirOfferPriceRS.Metadata.Other.CurrencyMetadatas.CurrencyMetadata[0].$.MetadataKey;
        logger.debug(`Found currency from nested metadata: ${currency}`);
    }

    // Use flatMap to handle nested arrays and filter nulls efficiently
    const optimizedFlights: FlightOffer[] = airlineOffers.flatMap((offerGroup: any) => { // Explicitly type the result array
        // AirlineOffer can be an array or a single object
        const actualOfferList = Array.isArray(offerGroup?.AirlineOffer)
            ? offerGroup.AirlineOffer
            : offerGroup?.AirlineOffer ? [offerGroup.AirlineOffer] : [];

        if (actualOfferList.length === 0) {
            logger.warn("Offer group encountered with no AirlineOffer inside.", { offerGroup });
            return []; // Skip this group
        }

        return actualOfferList.map((actualOffer: any): FlightOffer | null => { // Type the return of map
            const offerId = actualOffer.OfferID?._; // Adjusted path based on api-response.md
            const offerOwner = actualOffer.OfferID.Owner; // Airline code usually here
            const totalPrice = actualOffer.TotalPrice?.DetailCurrencyPrice?.Total?._; // Adjusted path
            const currencyCode = actualOffer.TotalPrice?.DetailCurrencyPrice?.Total?.$.Code || currency; // Price-specific currency

            // Pass the correct object containing references to the helper
            // The new API structure has refs at the root level instead of in PricedOffer.Offer.ApplicableFlight
            // It also has Associations in PricedOffer that may contain flight references
            
            // Log the structure to help with debugging
            logger.debug('Offer structure', {
                hasRefs: !!actualOffer.refs,
                refsLength: actualOffer.refs?.length,
                hasPricedOffer: !!actualOffer.PricedOffer,
                hasAssociations: !!actualOffer.PricedOffer?.Associations,
                associationsLength: actualOffer.PricedOffer?.Associations?.length
            });
            
            // Log the actual content of refs and associations for deeper inspection
            if (actualOffer.refs && actualOffer.refs.length > 0) {
                logger.debug('REFS CONTENT', { 
                    ref1: JSON.stringify(actualOffer.refs[0]),
                    ref2: actualOffer.refs.length > 1 ? JSON.stringify(actualOffer.refs[1]) : 'N/A'
                });
            }
            
            if (actualOffer.PricedOffer?.Associations) {
                logger.debug('ASSOCIATIONS CONTENT', { 
                    associations: JSON.stringify(actualOffer.PricedOffer.Associations)
                });
            }
            
            if (actualOffer.PricedOffer?.OfferPrice && actualOffer.PricedOffer.OfferPrice.length > 0) {
                logger.debug('OFFER PRICE CONTENT', { 
                    offerPrice: JSON.stringify(actualOffer.PricedOffer.OfferPrice[0]),
                    hasRequestedDate: !!actualOffer.PricedOffer.OfferPrice[0]?.RequestedDate,
                    hasAssociations: !!actualOffer.PricedOffer.OfferPrice[0]?.RequestedDate?.Associations
                });
            }
            
            let flightDetailsResult: FlightDetailsResult | null = null;
            
            // Try to extract flight details from refs at root level
            if (actualOffer.refs && actualOffer.refs.length > 0) {
                logger.debug('Attempting to extract flight details from refs', { offerId });
                flightDetailsResult = resolveFlightDetailsFromRefs(actualOffer.refs, dataLists);
            }
            
            // If that failed, try to extract from PricedOffer.Associations
            if (!flightDetailsResult && actualOffer.PricedOffer?.Associations) {
                logger.debug('Attempting to extract flight details from PricedOffer.Associations', { offerId });
                flightDetailsResult = resolveFlightDetailsFromRefs(actualOffer.PricedOffer.Associations, dataLists);
            }
            
            // If both attempts failed, check for any other possible locations
            if (!flightDetailsResult && actualOffer.PricedOffer?.OfferPrice?.[0]?.RequestedDate?.Associations) {
                logger.debug('Attempting to extract flight details from OfferPrice.RequestedDate.Associations', { offerId });
                flightDetailsResult = resolveFlightDetailsFromRefs(actualOffer.PricedOffer.OfferPrice[0].RequestedDate.Associations, dataLists);
            }
            
            // If all extraction attempts failed, log and skip this offer
            if (!flightDetailsResult) {
                logger.warn(`Could not find flight references for offer ${offerId}`, { offer: actualOffer });
                return null;
            }

            if (!flightDetailsResult || flightDetailsResult.segments.length === 0) {
                logger.warn(`Could not resolve valid flight/segment details for offer ${offerId}. Skipping offer.`, { flightDetailsResult });
                return null; // Skip if essential details couldn't be resolved
            }

            const { segments, duration } = flightDetailsResult;
            const firstSegment: FlightSegmentDetails = segments[0]; // Type the segment
            const lastSegment: FlightSegmentDetails = segments[segments.length - 1]; // Type the segment
            const stops = segments.length - 1;

            // Access flightNumber safely from firstSegment.airline
            // The imported FlightSegmentDetails type should define airline correctly
            const airlineInfo = {
                code: firstSegment.airline?.code || offerOwner || 'XX', // Use offer owner as fallback code
                name: firstSegment.airline?.name || offerOwner || 'Unknown Airline', // Use offer owner as fallback name
                logo: `/airlines/${(firstSegment.airline?.code || offerOwner || 'generic').toLowerCase()}.png`,
                flightNumber: firstSegment.airline?.flightNumber || 'N/A' // Use flight number from segment
            };

            // Attempt to find seat availability - path needs verification from actual response
            // Placeholder path: PricedOffer -> Associations -> AppliedFlight -> FlightSegment -> SeatAvailability -> AvailableCount
            let seats: number | string = 'N/A'; // Default to N/A if not found
            try {
                const seatInfo = actualOffer.PricedOffer?.Associations?.[0]?.AppliedFlight?.[0]?.FlightSegment?.[0]?.SeatAvailability?.AvailableCount?._;
                if (seatInfo !== undefined && seatInfo !== null) {
                    seats = parseInt(seatInfo, 10);
                    if (isNaN(seats)) seats = seatInfo; // Keep as string if parsing fails
                } else {
                    logger.debug(`Seat availability not found for offer ${offerId} at expected path.`);
                }
            } catch (e) {
                logger.warn(`Error accessing seat availability for offer ${offerId}`, { error: e, offer: actualOffer.PricedOffer });
            }

            // Construct the final simplified flight offer object
            const flightOffer: FlightOffer = {
                id: offerId || `GENERATED-${firstSegment.departure.airport}-${lastSegment.arrival.airport}-${Math.random().toString(36).substring(2, 8)}`, // Generate fallback ID
                airline: airlineInfo,
                departure: firstSegment.departure,
                arrival: lastSegment.arrival,
                duration: duration, // Use duration from resolved details
                stops: stops,
                // Fix lint error 2e068d28: Add type to 'seg'
                stopDetails: stops > 0 ? segments.slice(0, -1).map((seg: FlightSegmentDetails) => seg.arrival.airport) : [],
                price: typeof totalPrice === 'number' ? totalPrice : parseFloat(totalPrice) || 0, // Ensure price is a number
                currency: currencyCode, // Use currency from price or fallback
                seatsAvailable: seats,
            };
            logger.debug("Successfully processed offer", { offerId: flightOffer.id }); // Log ID for easier tracking
            return flightOffer;

        // Fix lint error 405e5682: Explicitly type 'offer' parameter
        }).filter((offer: FlightOffer | null): offer is FlightOffer => offer !== null);
    });

    logger.info(`Successfully optimized ${optimizedFlights.length} flight offers.`);
    return {
        flights: optimizedFlights,
        meta: {
            total: optimizedFlights.length,
            currency: currency,
            isFallbackData: false
        }
    };

}

// Flight API client configuration
const flightApiClient = axios.create({
    baseURL: process.env.FLIGHT_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.FLIGHT_API_KEY,
    },
    timeout: 10000, // 10 seconds timeout
})

// Add request interceptor for logging
flightApiClient.interceptors.request.use(
    (config) => {
        logger.info("Flight API request", {
            method: config.method,
            url: config.url,
            params: config.params,
        })
        return config
    },
    (error) => {
        logger.error("Flight API request error", { error })
        return Promise.reject(error)
    },
)

// Add response interceptor for logging
flightApiClient.interceptors.response.use(
    (response) => {
        logger.info("Flight API response", {
            status: response.status,
            url: response.config.url,
            data: response.data
        })
        return response
    },
    (error) => {
        logger.error("Flight API response error", {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data,
        })
        return Promise.reject(error)
    },
)


// Get flight details
export async function getFlightDetails(flightId: string): Promise<any> {
    try {
        const response = await flightApiClient.get(`/flights/${flightId}`)
        return response.data
    } catch (error) {
        logger.error("Error getting flight details", { error, flightId })
        throw error
    }
}

// Create booking
export async function createBooking(bookingData: any): Promise<any> {
    try {
        const response = await flightApiClient.post("/bookings", bookingData)
        return response.data
    } catch (error) {
        logger.error("Error creating booking", { error })
        throw error
    }
}

// Get booking details
export async function getBookingDetails(bookingReference: string): Promise<any> {
    try {
        const response = await flightApiClient.get(`/bookings/${bookingReference}`)
        return response.data
    } catch (error) {
        logger.error("Error getting booking details", { error, bookingReference })
        throw error
    }
}

// Cancel booking
export async function cancelBooking(bookingReference: string): Promise<any> {
    try {
        const response = await flightApiClient.post(`/bookings/${bookingReference}/cancel`)
        return response.data
    } catch (error) {
        logger.error("Error cancelling booking", { error, bookingReference })
        throw error
    }
}

// Types

export interface FlightSearchParams {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    passengers: number
    cabinClass?: string
}

export interface FlightSearchResult {
    flights: any[]
    meta: {
        total: number
        currency: string
    }
}

export interface Flight {
    id: string
    airline: {
        code: string
        name: string
        logo?: string
    }
    flightNumber: string
    departure: {
        airport: string
        city: string
        time: string
        date: string
        terminal?: string
    }
    arrival: {
        airport: string
        city: string
        time: string
        date: string
        terminal?: string
    }
    duration: string
    stops: number
    price: number
    seatsAvailable: number | string
}

export interface FlightDetails extends Flight {
    aircraft: string
    amenities: string[]
    baggageAllowance: {
        carryOn: string
        checked: string
    }
    refundable: boolean
    fareClass: string
}

export interface BookingCreateParams {
    flightId: string
    passengers: any[]
    contactInfo: any
    extras?: any
}

export interface BookingResult {
    bookingReference: string
    status: string
    totalAmount: number
    currency: string
}

export interface BookingDetails extends BookingResult {
    flightDetails: FlightDetails
    passengers: any[]
    contactInfo: any
    extras?: any
    createdAt: string
}

export interface BookingCancelResult {
    bookingReference: string
    status: string
    refundAmount?: number
}
