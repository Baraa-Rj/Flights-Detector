# Flight Search Application

A web application that allows users to search for flights using the Amadeus Flight Offers Search API.

## Features

- Search for flights by origin, destination, and dates
- View flight details including price, duration, and airline
- Support for round-trip and one-way flights
- Responsive design for desktop and mobile devices

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

### Installation

1. Clone or download this repository
2. Open the `index.html` file in your web browser

No server setup is required as this is a client-side application.

## How to Use

1. Enter the origin airport code (e.g., JFK, LAX, LHR)
2. Enter the destination airport code (e.g., CDG, SFO, DXB)
3. Select a departure date
4. Optionally select a return date for round-trip flights
5. Select the number of adult passengers
6. Click "Search Flights" to see available flight options

## API Information

This application uses the Amadeus Flight Offers Search API:
- Documentation: [https://developers.amadeus.com/self-service/category/air/api-doc/flight-offers-search](https://developers.amadeus.com/self-service/category/air/api-doc/flight-offers-search)

API credentials are included in the code:
- API Key: tLhHwRDQ3QpdAEmRR5E7F2vsSXsG9rfJ
- API Secret: OOJHRrmBQRIsriBK

## Known Limitations

- This application uses the Amadeus test environment, which has limited data
- Some airport codes may not return results in the test environment
- API rate limits may apply

## File Structure

- `index.html`: HTML structure of the application
- `styles.css`: CSS styling for the application
- `app.js`: JavaScript code that handles API calls and UI interactions

## License

This project is available for personal and educational use.

## Acknowledgements

- [Amadeus for Developers](https://developers.amadeus.com/) for providing the flight search API 