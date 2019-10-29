import 'babel-polyfill'
import 'colors'
import wd from 'wd'
import {assert} from 'chai'
import fs from 'fs'
import * as path from 'path'
import request from 'request'
import btoa from 'btoa'



// const username = process.env.KOBITON_USERNAME
// const apiKey = process.env.KOBITON_API_KEY
const username = 'chuanvo'
const apiKey = '8b75feca-91b9-4245-9814-72eda11815f7'
const deviceName = process.env.KOBITON_DEVICE_NAME || 'Galaxy*'

const kobitonServerConfig = {
  protocol: 'https',
  host: 'api-test.kobiton.com',
  auth: `${username}:${apiKey}`
}

let driver

const filePath = process.env.BITRISE_APK_PATH
const stats = fs.statSync(filePath);
const fileName = path.parse(filePath).base
  const inputBody = {
   'filename': fileName
  };
const base64EncodedBasicAuth = btoa(`${username}:${apiKey}`);
const headers = {
  'Authorization': `Basic ${base64EncodedBasicAuth}`,
  'Content-Type':'application/json',
  'Accept':'application/json'
};

if (!username || !apiKey) {
  console.log('Error: Environment variables KOBITON_USERNAME and KOBITON_API_KEY are required to execute script')
  process.exit(1)
}

describe('Android App sample',() => {
  before(async () => {

  try {
    const getUrl = await new Promise((resolve, reject) => {
      request({
        url: 'https://api-test.kobiton.com/v1/apps/uploadUrl',
        json: true,
        method: 'POST',
        body: inputBody,
        headers: headers
      }, function (err, res, body) {
        if (err || res.statusCode != 200) {
          return reject(err);
        }
        resolve(body);
      })
    })

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath).pipe(
          request({
              method: 'PUT',
              url: getUrl.url,
              headers: {
                  'Content-Length': stats.size,
                  'Content-Type': 'application/octet-stream',
                  'x-amz-tagging': 'unsaved=true'
              }
          },
          function (err, res, body) {
              if(err){
                  return reject(err);
              }
              resolve(body)
          })
      );
    })

    const createAppVersion = await new Promise((resolve, reject) => {
      request({
          url: 'https://api-test.kobiton.com/v1/apps',
          json: true,
          method: 'POST',
          body: {
              'filename' : fileName,
              'appPath': getUrl.appPath
          },
          headers: headers
      }, 
      function (err, res, body) {
          if (err) {
              return reject(err)
          }
          resolve(body)
      })
    })

    const app_id = createAppVersion.appId


    await new Promise((resolve) => setTimeout(resolve, 10000))

    driver = wd.promiseChainRemote(kobitonServerConfig)

    driver.on('status', (info) => {
      console.log(info.cyan)
    })
    driver.on('command', (meth, path, data) => {
      console.log(' > ' + meth.yellow, path.grey, data || '')
    })
    driver.on('http', (meth, path, data) => {
      console.log(' > ' + meth.magenta, path, (data || '').grey)
    })

    console.log('appppppppp=>>>>>>>', app_id)

    const desiredCaps = {
      sessionName:        'Automation test session',
      sessionDescription: 'This is an example for Android app',
      deviceOrientation:  'portrait',
      captureScreenshots: true,
      deviceGroup:        'KOBITON',
      deviceName:         deviceName,
      platformName:       'Android',
      app: `kobiton-store:${app_id}`,
      appPackage: 'io.appium.android.apis',
      appActivity: '.ApiDemos'
    }

    try {
      await driver.init(desiredCaps)
    }
    catch (err) {
      if (err.data) {
        console.error(`init driver: ${err.data}`)
      }
    throw err
    }



  }
  catch (error) {
      console.log('ERROR', error)
  }


  })

  it('should show the app label', async () => {
    await driver.elementByClassName("android.widget.TextView")
      .text().then(function(text) {
        assert.equal(text.toLocaleLowerCase(), 'api demos')
      })
  })

  after(async () => {
    if (driver != null) {
    try {
      await driver.quit()
    }
    catch (err) {
      console.error(`quit driver: ${err}`)
    }
  }
  })
})
