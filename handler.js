const { getChrome } = require("./chrome-script");
const puppeteer = require('puppeteer');

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

const getFormBody = (route, bound, seq, bsicode) => {
  bsicode = bsicode.replace(/-/g, "");

  const now = new Date();
  const utc = now.getTime();
  const ms = utc % 100;
  const timestamp =
    now.toISOString().replace(/T/, " ").replace(/\..+/, "") + "." + ms + ".";

  const sep = "--31" + timestamp + "13--";
  const token =
    route + sep + bound + sep + "1" + sep + bsicode + sep + seq + sep + utc;
  const token64 = "E" + Buffer.from(token).toString("base64");
  return [token64, timestamp];
};

let page;
// let browser;
module.exports.hello = async (event) => {
  const { route, bound, seq, bsicode } = event.queryStringParameters;
  const chrome = await getChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: chrome.endpoint,
  });
  page = await browser.newPage();
  // await page.goto(url, { waitUntil: 'networkidle0' });

  await page.goto("https://search.kmb.hk/KMBWebSite/index.aspx?lang=tc", {
    waitUntil: "networkidle0",
  });

  // https://44anguoruc.execute-api.ap-east-1.amazonaws.com/dev/?route=280X&bound=2&seq=3&bsicode=NA06-N-1800-0

  const formBody = getFormBody(route, bound, seq, bsicode);
  const getEta = async () => {
    const etaRes = await page.evaluate(async (formBody) => {
      const _captchaKey = await grecaptcha.execute(recaptchaKey, {
        action: "get_eta",
      });
      const response = await $.post(
        "/KMBWebSite/Function/FunctionRequest.ashx/?action=get_ETA&lang=1",
        {
          captcha: _captchaKey,
          token: formBody[0],
          t: formBody[1],
        }
      );
      return response.data;
    }, formBody);
    return etaRes;
  };

  const content = await getEta();

  return {
    statusCode: 200,
    body: JSON.stringify({
      content,
    }),
  };
};
