var store = require('react-native-simple-store');

export default App =  {
    auth_url: "http://dev.sage.care/api/v1/auth/cp/login/",
    base_url: "http://dev.sage.care/api/v1/auth/cp/s/",
    event_url: "http://dev.sage.care/api/v1/cp/s/events?",
    //event_url:"http://dev.sage.care/api/v1/cp/s/events?startDate=Sun%2001-17-2016%2013:07:44-0500&page=",
    past_event_url:"http://dev.sage.care/api/v1/cp/s/events?endDate=Sun%2001-17-2016%2013:07:44-0500&page=",
    availability_url:"http://dev.sage.care/api/v1/cp/s/availabilities?status=pending,active,cancelled&startDate=2015-10-03T23:00:00.000Z&page=",
    availability_url:"http://dev.sage.care/api/v1/cp/s/availabilities?status=pending,active,available&",

    //TODO - Don't Hard Code
    token:"eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZnVsbE5hbWUiOiJSb2JpbiBTaW5naCIsImVtYWlsIjoicm9iaW5Acm9iaW5zaW5naC5jbyJ9.OP2F7oh9fhs0Q0nWzlQijnGjU7kZuiqvCfsUIfAg2X8",
    headers: function(token) {
      return {
        'Authorization': 'Bearer '+token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    },
}
