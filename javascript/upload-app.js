import fs from 'fs'
import * as path from 'path'
import request from 'request'
import btoa from 'btoa'


const uploadApp = async (username, apiKey, filePath) => {

    const filePath = process.env.BITRISE_APK_PATH
    const stats = fs.statSync(filePath);
    const fileName = path.parse(filePath).base
    const inputBody = {
    'filename': fileName
    };
    const base64EncodedBasicAuth = btoa(`${username}:${apiKey}`)
    const headers = {
    'Authorization': `Basic ${base64EncodedBasicAuth}`,
    'Content-Type':'application/json',
    'Accept':'application/json'
    }

    try {
        console.log('Step 1: Generate Upload URL')
        const getUrl = await new Promise((resolve, reject) => {
        request({
            url: 'https://api-test.kobiton.com/v1/apps/uploadUrl',
            json: true,
            method: 'POST',
            body: inputBody,
            headers: headers
        }, function (err, response, body) {
            
            if (err || response.statusCode != 200) {
            console.log(err)
            return reject(err)
            
            }
            console.log('Response body:', body)
            console.log('Uploading...')
            resolve(body)
        })
        })

        console.log('Step 2: Upload File To S3')
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
                if (err) {
                console.log('Upload file Error', err)
                return reject(err)
                }
                console.log('Create App Version ...')
                resolve(body)
            })
        );
        })

        console.log('Step 3: Create Application Or Version')
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
            console.error('Error:', err)
            return reject(err)
            }
            console.log('Response body:', body)
            resolve(body)
            console.log('Done')
        })
        })

        if (createAppVersion.appId) {
            return createAppVersion.appId
        }

        await new Promise((resolve) => setTimeout(resolve, 10000))

    }
    catch (error) {
        console.log('ERROR', error)
    }
}

export { uploadApp as default }