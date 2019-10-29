import 'babel-polyfill'
import 'colors'
import wd from 'wd'
import {assert} from 'chai'
import uploadApp from './upload-app'



const username = 'chuanvo'
const apiKey = '8b75feca-91b9-4245-9814-72eda11815f7'

// const username = process.env.KOBITON_USERNAME
// const apiKey = process.env.KOBITON_API_KEY
const deviceName = process.env.KOBITON_DEVICE_NAME || 'Galaxy*'

const kobitonServerConfig = {
  protocol: 'https',
  host: 'api-test.kobiton.com',
  auth: `${username}:${apiKey}`
}

const desiredCaps = {
  sessionName:        'Automation test session',
  sessionDescription: 'This is an example for Android app',
  deviceOrientation:  'portrait',
  captureScreenshots: true,
  deviceGroup:        'KOBITON',
  deviceName:         deviceName,
  platformName:       'Android',
  automationName: 'UiAutomator2'
}

let driver

if (!username || !apiKey) {
  console.log('Error: Environment variables KOBITON_USERNAME and KOBITON_API_KEY are required to execute script')
  process.exit(1)
}

/* 
- filePath is the path to install app file, which is generated after buid step.
*/ 
// const filePath = process.env.BITRISE_APK_PATH
// const stats = fs.statSync(filePath);
// const fileName = path.parse(filePath).base
//   const inputBody = {
//   'filename': fileName
//   };
// const base64EncodedBasicAuth = btoa(`${username}:${apiKey}`)
// const headers = {
//   'Authorization': `Basic ${base64EncodedBasicAuth}`,
//   'Content-Type':'application/json',
//   'Accept':'application/json'
// }

// const uploadApp = async () => {
//   try {
//     console.log('Step 1: Generate Upload URL')
//     const getUrl = await new Promise((resolve, reject) => {
//       request({
//         url: 'https://api-test.kobiton.com/v1/apps/uploadUrl',
//         json: true,
//         method: 'POST',
//         body: inputBody,
//         headers: headers
//       }, function (err, response, body) {
        
//         if (err || response.statusCode != 200) {
//           console.log(err)
//           return reject(err)
        
//         }
//         console.log('Response body:', body)
//         console.log('Uploading...')
//         resolve(body)
//       })
//     })

//     console.log('Step 2: Upload File To S3')
//     await new Promise((resolve, reject) => {
//       fs.createReadStream(filePath).pipe(
//           request({
//               method: 'PUT',
//               url: getUrl.url,
//               headers: {
//                   'Content-Length': stats.size,
//                   'Content-Type': 'application/octet-stream',
//                   'x-amz-tagging': 'unsaved=true'
//               }
//           },
//           function (err, res, body) {
//             if (err) {
//               console.log('Upload file Error', err)
//               return reject(err)
//             }
//             console.log('Create App Version ...')
//             resolve(body)
//           })
//       );
//     })

//     console.log('Step 3: Create Application Or Version')
//     const createAppVersion = await new Promise((resolve, reject) => {
//       request({
//           url: 'https://api-test.kobiton.com/v1/apps',
//           json: true,
//           method: 'POST',
//           body: {
//               'filename' : fileName,
//               'appPath': getUrl.appPath
//           },
//           headers: headers
//       }, 
//       function (err, res, body) {
//         if (err) {
//           console.error('Error:', err)
//           return reject(err)
//         }
//         console.log('Response body:', body)
//         resolve(body)
//         console.log('Done')
//       })
//     })

//     if (createAppVersion.appId) {
//       desiredCaps.app = `kobiton-store:${createAppVersion.appId}`
//     }

//     await new Promise((resolve) => setTimeout(resolve, 10000))

//   }
//   catch (error) {
//       console.log('ERROR', error)
//   }
// }

describe('Android App sample',() => {
  before(async () => {
  
  const appId = await uploadApp(username, apiKey, process.env.BITRISE_APK_PATH)
  desiredCaps.app = `kobiton-store:${appId}`

  await new Promise((resolve) => setTimeout(resolve, 5000))


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

  try {
    await driver.init(desiredCaps)
  }
  catch (err) {
    if (err.data) {
      console.error(`init driver: ${err.data}`)
    }
  throw err
  }


  })

  it('TestCase_Name', async () => {
    console.log("Done test!")
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
