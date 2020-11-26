const puppeteer = require('puppeteer');
const { getChrome } = require('./chrome-script');


const BASE_URL = `https://search.kmb.hk/kmbwebsite/Function/FunctionRequest.ashx?action=`;
const URL_MAKER = (action, route, bound, lang) => {
  let _url = BASE_URL + action;

  if (route) {
    _url += "&route=" + route;
  }

  if (bound) {
    _url += "&bound=" + bound;
  }

  if (lang) {
    _url += "&lang=" + lang;
  }

  return _url;
};


module.exports.hello = async (event) => {
  const { url } = event.queryStringParameters;
  const chrome = await getChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: chrome.endpoint,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  const content = await page.evaluate(() => document.body.innerHTML);
  return {
    statusCode: 200,
    body: JSON.stringify({
      content,
    }),
  };
};
