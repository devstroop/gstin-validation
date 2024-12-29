# GSTIN Validation Worker

This project is a Cloudflare Worker that validates and fetches details for a given GSTIN (Goods and Services Tax Identification Number) using the "knowyourgst.com" service.

## Setup

1. **Install Dependencies**: Run `npm install` to install the required dependencies.
2. **Development Server**: Run `npm run dev` to start a development server.
3. **Deploy**: Run `npm run deploy` to publish your worker.

## Usage

To use the worker, make a GET request to the worker URL with the `gstin` query parameter. For example:

```
[https://your-worker.your-username.workers.dev/?gstin=29AAAAA0000A1Z5](https://gstin-validation.devstroop.workers.dev/)
```

## Functions

- **isValidGSTIN(gstin)**: Validates the GSTIN format.
- **getCsrfToken()**: Fetches the CSRF token required for making POST requests.
- **postGstinDetails(gstin, csrfToken)**: Posts the GSTIN details to the service and retrieves the response.
- **parseGstinDetails(responseBody)**: Parses the response body to extract GSTIN details.

## Error Handling

The worker returns appropriate error messages and status codes for invalid GSTIN formats and failed requests.

## Learn More

Learn more about Cloudflare Workers at [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/).
