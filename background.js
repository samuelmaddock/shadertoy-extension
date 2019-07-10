const SHADERTOY_API_KEY = 'Nt8tMH'

const fetchShaderById = async (id) => {
    const response = await fetch(`https://www.shadertoy.com/api/v1/shaders/${id}?key=${SHADERTOY_API_KEY}`)
    if (response.ok) {
        if (response.headers.get('Content-Type') === 'application/json') {
            const json = await response.json()
            return json
        }
    }
    throw new Error('Failed to fetch ShaderToy script')
}

const injectScript = (tabId, details) => new Promise((resolve, reject) => {
    chrome.tabs.executeScript(tabId, details, () => {
        if (chrome.runtime.lastError) {
            console.log(`ExecuteScript error: ${chrome.runtime.lastError}`)
            reject(chrome.runtime.lastError.message)
        } else {
            resolve()
        }
    })
})

const injectScripts = async (tabId, details) => {
    const files = Array.isArray(details.file) ? details.file : [details.file]
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const { files: _, ...restDetails } = details
        await injectScript(tabId, { ...restDetails, file })
    }
}

chrome.browserAction.onClicked.addListener(async tab => {
    // TODO: show popup to select shader for injecting
    // Temporarily, we'll just inject into active tab

    // https://www.shadertoy.com/view/ldXGW4
    const shaderId = 'ldXGW4'
    // const shaderId = 'XtK3W3'
    // const shaderId = 'lssBDs'
    // const shaderId = 'MddSRB'
    const { Shader: shaderScript } = await fetchShaderById(shaderId)
    console.log('SHADER SCRIPT', shaderScript)

    await injectScripts(tab.id, {
        file: [
            '/piLibs.js',
            '/effect.js',
            // '/gl-matrix.js',
            '/setup.js',
        ],
        allFrames: true
    })

    let json = JSON.stringify(shaderScript)
    await injectScript(tab.id, {
        code: `setShader(${json})`,
        allFrames: true
    })
})
