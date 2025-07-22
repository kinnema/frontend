// Client-side version of getAccessToken
export async function getAccessToken() {
  // For client-side, we'll get the token from localStorage or make an API call
  return localStorage.getItem('access_token');
}