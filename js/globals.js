/**
 * function generate_uw_api_url(endpoint, params)
 *
 * Returns the URL for an endpoint of the
 * University of Waterloo Open Data API
 * (see https://uwaterloo.ca/api)
 */
function generate_uw_api_url(endpoint, params) {
   params = params || {};

   params['key'] = params['key'] || UW_API_KEY;

   return URI(UW_API_BASE)
            .segment(endpoint)
            .search(params)
            .href();
}



function decode_uw_api_response(error, response) {
   console.debug('UW API response', error, response);

   // Check if an error occured
   if (error) {
      console.error(error);
      return false;
   }// End of if

   // Check that the API returned
   // a non-error response
   if (response.meta && [200, 204].indexOf(response.meta.status) === -1) {
      console.error(response);
      return false;
   }// End of if

   return response.data || null;
}
