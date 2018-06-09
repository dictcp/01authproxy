01authproxy - simple authroization proxy
====

01authproxy is a simple proxy for authroization. It is designed for the combination usage of oauth2_proxy or AWS ALB Built-in Authentication. It assumes the authentication is ready and do simple string matching on some header (eg. X-Forwarded-Email).

Example usage
----

```
echo '{"groups":["a@b.com"]}' > a.json
env email_header=email check_url=a.json check_prefix=groups upstream_url=http://http.badssl.com/ node server.js
http -v GET http://127.0.0.1:8181/ email:a@b.com
```
