var http = require('http');
var https = require('https');
var url = require('url');
var axios = require('axios');
var fs = require('fs');
var _ = require('lodash');

const checkEmail = async (email) => {
    const check_url = process.env.check_url;
    var file;
    if (/^(http:\/\/|https:\/\/)/.test(check_url)) {
        console.log(`query to ${check_url}`)
        var res = await axois.get(check_url);
        file = res.data;
    } else {
        console.log(`check file ${check_url}`)
        file = JSON.parse(fs.readFileSync(check_url));
    }
   
    console.log(`process.env.check_groups: ${process.env.check_groups}`)

    var check_prefixes;
    const check_groups = process.env.check_groups ? process.env.check_groups.split(',') : [];

    if (check_groups.length > 0) {
        check_prefixes = check_groups.map((x)=> `${x}.${process.env.check_prefix}`)
    } else {
        check_prefixes = [process.env.check_prefix];
    }

    console.log(`check_prefixes: ${JSON.stringify(check_prefixes)}`)

    for (check_prefix of check_prefixes) {
        console.log(`check prefix: ${check_prefix}`)
        var map = _.get(file, check_prefix); 
        if (!Array.isArray(map)) {
            map = Object.keys(map);
        }
        if (map.includes(email)) return true
    }

    // no match for all groups
    return false
}
const server = async (request, response) => {
    try {
    console.log("received request")
  
    var upstream = url.parse(process.env.upstream_url);

    var options = {
        protocol: upstream.protocol,
        host: upstream.host,
        port: upstream.port,

        path: request.url,       
        method: request.method,
        headers: {
           ...request.headers
        }       
    };

    const email = request.headers[process.env.email_header];
    console.log("checking email" + email)

    const ok = await checkEmail(email);

    if (ok) { 
        console.log("requesting upstream")
        if (options.protocol == "http:") {
            var req = http.request(options, (res) => {
                response.writeHead(res.statusCode, res.headers);
                res.pipe(response);
            }).end();
        } else if (options.protocol == "https:") {
            var req = https.request(options, (res) => {
                response.writeHead(res.statusCode, res.headers);
                res.pipe(response);
            }).end();
        } else {
            response.statusCode = 500;
            response.end();
        }
    } else {
        response.statusCode = 403;
        response.end();
    }
    } catch (e) { console.log(e)}
}

var proxy = http.createServer(server).listen(8181);
