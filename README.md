
# KMB ETA API
A serverless funtion appied the headerless browser running in AWS lambda to fetch the KMB Bus ETA API data.


## Blog posts
- https://www.adamliu.net/how-to-use-the-headerless-browser-to-fetch-the-hk-kmb-eta-data-fight-with-the-recaptcha
- https://www.adamliu.net/say-byebye-to-the-eta-features-in-my-wechat-miniprogram

## Run locally 

```
npm install -g serverless
# cd to the floder
npm i
sls offline
# open this link in browser http://localhost:3000/?route=280X&bound=2&seq=3&bsicode=NA06-N-1800-0
```


## Deploy on AWS Lambda

### Prepare the lambda layer
The `puppeteer` is too big, the size is more that 262144000 bytes(lambda unzipped size limit).
`puppeteer-core` is recommended to lambda.

1. Follow the link section to add the lambda layer
    https://github.com/alixaxel/chrome-aws-lambda#aws-lambda-layer
2. It will get the ARN if added successfully.
3. Update `serverless.yml` `layers` key.
4. Remember to remove `node_modules` and rerun `npm install` if package.json changes. 

### CLI
```
sls deploy
# 1. change the serverless to specify aws profile
# 2. if deploy successfully, you will get  a link from AWS API Gateway
# 3. call the link in browser to test the lambda https://xxx.amazonaws.com/dev/?route=280X&bound=2&seq=3&bsicode=NA06-N-1800-0

```


## REF
1. Lambda IP ranges
https://docs.aws.amazon.com/general/latest/gr/aws-ip-ranges.html
