let request = (function () {

    const baseUrl = 'https://charity-shop.herokuapp.com';

    function makeRequest(method, endpoint) {
        return {
            method: method,
            url: baseUrl + endpoint
        }
    }

    function post(endpoint, data) {
        let obj = makeRequest('POST', endpoint)
        if(data){
            obj.data = data;
        }
        return $.ajax(obj)
    }

    function get(endpoint) {
        return $.ajax(makeRequest('GET', endpoint))
    }

    return {
        post,
        get
    }
})()