// const { getChrome } = require("./chrome-script");
// const puppeteer = require('puppeteer');

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

const chromium = require("chrome-aws-lambda");

exports.main = async (event, context) =>{
  const { route, bound, seq, bsicode } = event.queryStringParameters;

  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    // await page.goto(event.url || "https://example.com");

    await page.goto("https://search.kmb.hk/KMBWebSite/index.aspx?lang=tc");

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


    result = {
      statusCode: 200,
      body: JSON.stringify({
        content,
      }),
    };

  } catch (error) {
    return error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return result
};