// API Credentials
const API_KEY = 'tLhHwRDQ3QpdAEmRR5E7F2vsSXsG9rfJ';
const API_SECRET = 'OOJHRrmBQRIsriBK';

// Common city to airport code mappings
const cityMap = {
    "new york": "JFK",
    "london": "LHR",
    "paris": "CDG",
    "tokyo": "HND",
    "sydney": "SYD",
    "dubai": "DXB",
    "rome": "FCO",
    "los angeles": "LAX",
    "madrid": "MAD",
    "singapore": "SIN",
    "bangkok": "BKK",
    "berlin": "BER",
    "chicago": "ORD",
    "toronto": "YYZ",
    "amsterdam": "AMS",
    "barcelona": "BCN",
    "istanbul": "IST",
    "hong kong": "HKG",
    "san francisco": "SFO"
};

// Mapping for airline codes to airline names
const airlineMap = {
    "AA": "American Airlines",
    "AC": "Air Canada",
    "AF": "Air France",
    "AZ": "Alitalia",
    "BA": "British Airways",
    "DL": "Delta Air Lines",
    "EK": "Emirates",
    "EY": "Etihad Airways",
    "LH": "Lufthansa",
    "KL": "KLM Royal Dutch Airlines",
    "QF": "Qantas",
    "QR": "Qatar Airways",
    "SQ": "Singapore Airlines",
    "TK": "Turkish Airlines",
    "UA": "United Airlines",
    "VS": "Virgin Atlantic",
    "WN": "Southwest Airlines",
    "B6": "JetBlue",
    "FR": "Ryanair",
    "U2": "easyJet",
    "LX": "Swiss International Air Lines",
    "IB": "Iberia",
    "JL": "Japan Airlines",
    "NH": "All Nippon Airways",
    "CX": "Cathay Pacific",
    "MH": "Malaysia Airlines",
    "SU": "Aeroflot",
    "EI": "Aer Lingus",
    "AY": "Finnair",
    "SK": "SAS Scandinavian Airlines"
};

// Reverse mapping from airport codes to city names
const airportToCity = Object.entries(cityMap).reduce((acc, [city, code]) => {
    acc[code] = city.charAt(0).toUpperCase() + city.slice(1);
    return acc;
}, {});

// DOM Elements
const form = {
    origin: document.getElementById('origin'),
    destination: document.getElementById('destination'),
    originSuggestions: document.getElementById('origin-suggestions'),
    destinationSuggestions: document.getElementById('destination-suggestions'),
    departureDate: document.getElementById('departure-date'),
    returnDate: document.getElementById('return-date'),
    returnDateGroup: document.getElementById('return-date-group'),
    tripType: document.getElementById('trip-type'),
    searchBtn: document.getElementById('search-btn')
};

const ui = {
    tabs: document.querySelectorAll('.tab'),
    loader: document.getElementById('loader'),
    results: document.getElementById('results'),
    resultsContainer: document.getElementById('results-container'),
    errorMessage: document.getElementById('error-message'),
    errorText: document.getElementById('error-text'),
    sortPriceBtn: document.getElementById('sort-price'),
    filterDirectBtn: document.getElementById('filter-direct'),
    modal: document.getElementById('flight-details-modal'),
    modalContent: document.getElementById('modal-content'),
    closeModal: document.getElementById('close-modal')
};

// Store flight data for sorting and filtering
let flightData = [];
let sortDirection = 'asc';
let showOnlyDirect = false;

// Initialize
function init() {
    // Set min date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    form.departureDate.min = today;
    form.returnDate.min = today;
    
    // Set default departure date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    form.departureDate.value = tomorrow.toISOString().split('T')[0];
    
    // Set return date to day after tomorrow for round trip
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    form.returnDate.value = dayAfterTomorrow.toISOString().split('T')[0];
    
    // Add event listeners
    form.departureDate.addEventListener('change', updateReturnDateMin);
    form.searchBtn.addEventListener('click', searchFlights);
    
    // Tab switching
    ui.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            ui.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            form.tripType.value = tab.dataset.type;
            toggleReturnDate();
        });
    });
    
    // Auto-suggestions for city inputs
    form.origin.addEventListener('input', () => showSuggestions(form.origin, form.originSuggestions));
    form.destination.addEventListener('input', () => showSuggestions(form.destination, form.destinationSuggestions));
    
    // Focus/blur events for suggestions
    form.origin.addEventListener('focus', () => showSuggestions(form.origin, form.originSuggestions));
    form.destination.addEventListener('focus', () => showSuggestions(form.destination, form.destinationSuggestions));
    
    document.addEventListener('click', (e) => {
        if (e.target !== form.origin && e.target !== form.originSuggestions) {
            form.originSuggestions.innerHTML = '';
        }
        if (e.target !== form.destination && e.target !== form.destinationSuggestions) {
            form.destinationSuggestions.innerHTML = '';
        }
    });
    
    // Sort and filter buttons
    ui.sortPriceBtn.addEventListener('click', togglePriceSort);
    ui.filterDirectBtn.addEventListener('click', toggleDirectFilter);
    
    // Modal close button
    ui.closeModal.addEventListener('click', () => {
        ui.modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === ui.modal) {
            ui.modal.style.display = 'none';
        }
    });
    
    // Also close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && ui.modal.style.display === 'block') {
            ui.modal.style.display = 'none';
        }
    });
    
    // Initial state
    toggleReturnDate();
}

// Show city suggestions
function showSuggestions(inputElement, suggestionsElement) {
    const input = inputElement.value.toLowerCase().trim();
    suggestionsElement.innerHTML = '';
    
    if (input.length < 2) return;
    
    const matches = Object.keys(cityMap).filter(city => 
        city.toLowerCase().includes(input)
    );
    
    if (matches.length === 0) return;
    
    matches.slice(0, 5).forEach(match => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = `${match.charAt(0).toUpperCase() + match.slice(1)} (${cityMap[match]})`;
        
        item.addEventListener('click', () => {
            inputElement.value = match.charAt(0).toUpperCase() + match.slice(1);
            suggestionsElement.innerHTML = '';
        });
        
        suggestionsElement.appendChild(item);
    });
}

// Toggle return date based on trip type
function toggleReturnDate() {
    if (form.tripType.value === 'one-way') {
        form.returnDateGroup.style.display = 'none';
        form.returnDate.value = '';
    } else {
        form.returnDateGroup.style.display = 'block';
    }
}

// Update return date minimum value
function updateReturnDateMin() {
    form.returnDate.min = form.departureDate.value;
    if (form.returnDate.value && form.returnDate.value < form.departureDate.value) {
        form.returnDate.value = form.departureDate.value;
    }
}

// Search flights
async function searchFlights() {
    // Validate inputs
    if (!validateInputs()) return;
    
    // Show loader and apply animation
    ui.loader.style.display = 'block';
    ui.results.style.display = 'none';
    ui.errorMessage.style.display = 'none';
    ui.resultsContainer.innerHTML = '';
    
    // Scroll to loader
    ui.loader.scrollIntoView({ behavior: 'smooth' });
    
    try {
        // Get access token
        const token = await getAccessToken();
        
        // Fetch flight offers
        flightData = await fetchFlightOffers(token);
        
        // Reset filters and sort
        sortDirection = 'asc';
        showOnlyDirect = false;
        ui.sortPriceBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Sort by Price';
        ui.filterDirectBtn.classList.remove('active');
        
        // Display results
        displayResults(flightData);
        
        // Scroll to results with smooth animation
        setTimeout(() => {
            ui.results.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        
    } catch (error) {
        showError(error.message || 'An error occurred. Please try again.');
    } finally {
        ui.loader.style.display = 'none';
    }
}

// Toggle price sorting
function togglePriceSort() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    
    // Update button icon
    if (sortDirection === 'asc') {
        ui.sortPriceBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Sort by Price';
    } else {
        ui.sortPriceBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i> Sort by Price';
    }
    
    // Filter and sort the flights
    const filteredAndSortedFlights = filterAndSortFlights(flightData);
    displayResults(filteredAndSortedFlights, false);
}

// Toggle direct flights filter
function toggleDirectFilter() {
    showOnlyDirect = !showOnlyDirect;
    ui.filterDirectBtn.classList.toggle('active');
    
    // Filter and sort the flights
    const filteredAndSortedFlights = filterAndSortFlights(flightData);
    displayResults(filteredAndSortedFlights, false);
}

// Filter and sort flights
function filterAndSortFlights(flights) {
    // Apply direct filter if active
    let result = showOnlyDirect 
        ? flights.filter(flight => 
            flight.itineraries.every(itinerary => 
                itinerary.segments.length === 1)
          )
        : flights;
    
    // Apply sorting
    result.sort((a, b) => {
        const priceA = parseFloat(a.price.total);
        const priceB = parseFloat(b.price.total);
        return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
    });
    
    return result;
}

// Get airline name from carrier code
function getAirlineName(carrierCode) {
    return airlineMap[carrierCode] || carrierCode;
}

// Show flight details in modal
function showFlightDetails(flight) {
    // Clear previous content
    ui.modalContent.innerHTML = '';
    
    // Get flight basic info
    const price = flight.price.total;
    const currency = flight.price.currency;
    const airlines = getAirlineNamesWithFull(flight);
    
    // Build modal content for each itinerary
    const itinerariesHtml = flight.itineraries.map((itinerary, index) => {
        const isReturn = index === 1;
        
        // Create segments HTML
        const segmentsHtml = itinerary.segments.map((segment, segIdx) => {
            // Get times and format them
            const departureTime = new Date(segment.departure.at);
            const arrivalTime = new Date(segment.arrival.at);
            
            // Format dates for display
            const departureDate = departureTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
            
            const arrivalDate = arrivalTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
            
            // Format times
            const departureTimeStr = departureTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            const arrivalTimeStr = arrivalTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            // Get city names from airport codes
            const departureCity = airportToCity[segment.departure.iataCode] || segment.departure.iataCode;
            const arrivalCity = airportToCity[segment.arrival.iataCode] || segment.arrival.iataCode;
            
            // Get airline name
            const airlineName = getAirlineName(segment.carrierCode);
            
            // Create segment HTML
            return `
                <div class="flight-segment">
                    <div class="segment-header">
                        <div class="segment-airline">
                            <i class="fas fa-plane"></i> ${airlineName}
                            <span class="segment-flight-number">${segment.carrierCode} ${segment.number}</span>
                        </div>
                        <div class="segment-info">
                            ${segIdx > 0 ? '<span class="connection-label">Connection</span>' : ''}
                        </div>
                    </div>
                    <div class="segment-details">
                        <div class="segment-station departure">
                            <div class="station-time">${departureTimeStr}</div>
                            <div class="station-airport">${segment.departure.iataCode}</div>
                            <div class="station-date">${departureDate}</div>
                            <div class="station-city">${departureCity}</div>
                        </div>
                        <div class="segment-duration">
                            <div class="duration-time">${formatDuration(segment.duration)}</div>
                            <div class="duration-line"></div>
                        </div>
                        <div class="segment-station arrival">
                            <div class="station-time">${arrivalTimeStr}</div>
                            <div class="station-airport">${segment.arrival.iataCode}</div>
                            <div class="station-date">${arrivalDate}</div>
                            <div class="station-city">${arrivalCity}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Create itinerary section
        return `
            <div class="flight-itinerary">
                <h3>${isReturn ? 'Return Flight' : 'Outbound Flight'}</h3>
                <div class="segments">
                    ${segmentsHtml}
                </div>
            </div>
            ${index === 0 && flight.itineraries.length > 1 ? '<div class="itinerary-divider"><span>Return</span></div>' : ''}
        `;
    }).join('');
    
    // Add price summary and airlines
    const priceSummary = `
        <div class="price-summary">
            <div class="total-price">${currency} ${parseFloat(price).toFixed(2)}</div>
            <div class="price-detail">Total price for all passengers</div>
            <div class="airlines-operated">Operated by: ${airlines}</div>
        </div>
    `;
    
    // Combine all sections
    ui.modalContent.innerHTML = `
        ${itinerariesHtml}
        ${priceSummary}
    `;
    
    // Show modal
    ui.modal.style.display = 'block';
}

// Format duration from ISO duration
function formatDuration(isoDuration) {
    const hours = isoDuration.match(/(\d+)H/);
    const minutes = isoDuration.match(/(\d+)M/);
    
    return `${hours ? hours[1] + 'h ' : ''}${minutes ? minutes[1] + 'm' : ''}`;
}

// Validate user inputs
function validateInputs() {
    // Reset error message
    ui.errorMessage.style.display = 'none';
    
    // Check required fields
    if (!form.origin.value.trim()) {
        showError('Please enter an origin city');
        form.origin.focus();
        return false;
    }
    
    if (!form.destination.value.trim()) {
        showError('Please enter a destination city');
        form.destination.focus();
        return false;
    }
    
    // Check if origin and destination are different
    if (form.origin.value.trim().toLowerCase() === form.destination.value.trim().toLowerCase()) {
        showError('Origin and destination cannot be the same');
        return false;
    }
    
    // Check if departure date is provided
    if (!form.departureDate.value) {
        showError('Please select a departure date');
        form.departureDate.focus();
        return false;
    }
    
    // Check if return date is provided for round trips
    if (form.tripType.value === 'round-trip' && !form.returnDate.value) {
        showError('Please select a return date');
        form.returnDate.focus();
        return false;
    }
    
    return true;
}

// Show error message
function showError(message) {
    ui.errorText.textContent = message;
    ui.errorMessage.style.display = 'block';
    ui.loader.style.display = 'none';
    
    // Smooth scroll to error message
    ui.errorMessage.scrollIntoView({ behavior: 'smooth' });
    
    // Shake animation
    ui.errorMessage.classList.remove('shake-animation');
    setTimeout(() => {
        ui.errorMessage.classList.add('shake-animation');
    }, 10);
}

// Get Amadeus access token
async function getAccessToken() {
    const url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', API_KEY);
    formData.append('client_secret', API_SECRET);
    
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to authenticate with the flight API');
    }
    
    const data = await response.json();
    return data.access_token;
}

// Get airport code from city name
function getAirportCode(city) {
    const cityLower = city.trim().toLowerCase();
    return cityMap[cityLower] || city.toUpperCase();
}

// Fetch flight offers from API
async function fetchFlightOffers(token) {
    // Get airport codes
    const origin = getAirportCode(form.origin.value);
    const destination = getAirportCode(form.destination.value);
    
    // Construct URL
    let url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${form.departureDate.value}&adults=1&nonStop=false&max=20&currencyCode=USD`;
    
    // Add return date for round trips
    if (form.tripType.value === 'round-trip' && form.returnDate.value) {
        url += `&returnDate=${form.returnDate.value}`;
    }
    
    // Make API request
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch flights');
    }
    
    const data = await response.json();
    
    // Log the raw JSON data to console
    console.log('Raw API Response:', data);
    
    if (!data.data || data.data.length === 0) {
        throw new Error('No flights found for the selected criteria');
    }
    
    return data.data;
}

// Display flight results
function displayResults(flights, withAnimation = true) {
    // Clear previous results
    ui.resultsContainer.innerHTML = '';
    
    if (flights.length === 0) {
        ui.resultsContainer.innerHTML = '<div class="no-flights">No flights match your filter criteria</div>';
        ui.results.style.display = 'block';
        return;
    }
    
    // Results count
    const resultsCount = document.createElement('div');
    resultsCount.className = 'results-count';
    resultsCount.textContent = `${flights.length} flights found`;
    ui.resultsContainer.appendChild(resultsCount);
    
    // Create flight cards
    flights.forEach((flight, index) => {
        const card = document.createElement('div');
        card.className = 'flight-card';
        if (withAnimation) {
            card.style.animationDelay = `${index * 0.1}s`;
        }
        
        // Get flight info
        const price = flight.price.total;
        const currency = flight.price.currency;
        const airlinesInfo = getAirlineNamesWithFull(flight);
        
        // Check if direct flight
        const isDirectFlight = flight.itineraries.every(itinerary => itinerary.segments.length === 1);
        
        // Calculate total duration
        const totalDuration = flight.itineraries.reduce((total, itinerary) => {
            const duration = itinerary.duration;
            const hours = duration.match(/(\d+)H/) ? parseInt(duration.match(/(\d+)H/)[1]) : 0;
            const minutes = duration.match(/(\d+)M/) ? parseInt(duration.match(/(\d+)M/)[1]) : 0;
            return total + (hours * 60) + minutes;
        }, 0);
        
        // Format hours and minutes
        const durationHours = Math.floor(totalDuration / 60);
        const durationMinutes = totalDuration % 60;
        const formattedDuration = `${durationHours}h ${durationMinutes}m`;
        
        // Get departure and arrival times for first segment
        const firstItinerary = flight.itineraries[0];
        const firstSegment = firstItinerary.segments[0];
        const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];
        
        const departureTime = new Date(firstSegment.departure.at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        const arrivalTime = new Date(lastSegment.arrival.at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        // Get formatted dates
        const departureDate = new Date(firstSegment.departure.at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        // Enhanced flight card
        card.innerHTML = `
            <div class="airline">
                <i class="fas fa-plane"></i> ${airlinesInfo}
                ${isDirectFlight ? '<span class="direct-badge">Direct</span>' : 
                '<span class="stops-badge">'+ (firstItinerary.segments.length - 1) +' Stop(s)</span>'}
            </div>
            <div class="flight-times">
                <div class="time-item">
                    <div class="time">${departureTime}</div>
                    <div class="airport">${firstSegment.departure.iataCode}</div>
                    <div class="date">${departureDate}</div>
                </div>
                <div class="duration">
                    <div class="duration-line"></div>
                    <div class="duration-text">${formattedDuration}</div>
                </div>
                <div class="time-item">
                    <div class="time">${arrivalTime}</div>
                    <div class="airport">${lastSegment.arrival.iataCode}</div>
                </div>
            </div>
            <div class="price-row">
                <div class="price">${currency} ${parseFloat(price).toFixed(2)}</div>
            </div>
        `;
        
        // Add click event to show flight details
        card.addEventListener('click', () => {
            showFlightDetails(flight);
        });
        
        ui.resultsContainer.appendChild(card);
    });
    
    // Show results section
    ui.results.style.display = 'block';
}

// Get airline names from flight data
function getAirlineNames(flight) {
    const airlines = new Set();
    
    flight.itineraries.forEach(itinerary => {
        itinerary.segments.forEach(segment => {
            if (segment.carrierCode) {
                airlines.add(segment.carrierCode);
            }
        });
    });
    
    return Array.from(airlines).join(', ');
}

// Get airline names with full company names
function getAirlineNamesWithFull(flight) {
    const airlines = new Set();
    
    flight.itineraries.forEach(itinerary => {
        itinerary.segments.forEach(segment => {
            if (segment.carrierCode) {
                const airlineName = getAirlineName(segment.carrierCode);
                airlines.add(airlineName);
            }
        });
    });
    
    return Array.from(airlines).join(', ');
}

// Initialize the app
init(); 