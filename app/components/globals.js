var store = require('react-native-simple-store');

export default App =  {
    auth_url: "https://app.sage.care/api/v1/auth/cp/login/",
    base_url: "https://app.sage.care/api/v1/auth/cp/s/",
    event_url: "https://app.sage.care/api/v1/cp/s/events?",
    availability_url:"https://app.sage.care/api/v1/cp/s/availabilities?status=pending,active,available&",

    /*
    auth_url: "http://dev.sage.care/api/v1/auth/cp/login/",
    base_url: "http://dev.sage.care/api/v1/auth/cp/s/",
    event_url: "http://dev.sage.care/api/v1/cp/s/events?",
    availability_url:"http://dev.sage.care/api/v1/cp/s/availabilities?status=pending,active,available&",
    */

    headers: function(token) {
      return {
        'Authorization': 'Bearer '+token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    },
}
