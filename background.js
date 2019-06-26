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
            reject(chrome.runtime.lastError)
        } else {
            resolve()
        }
    })
})

chrome.browserAction.onClicked.addListener(async tab => {
    // TODO: show popup to select shader for injecting
    // Temporarily, we'll just inject into active tab

    // https://www.shadertoy.com/view/ldXGW4
    // const shaderId = 'ldXGW4'
    // const shaderScript = await fetchShaderById(shaderId)
    // console.log('SHADER SCRIPT', shaderScript)

    await injectScript(tab.id, {
        file: '/gl-matrix.js',
        allFrames: true
    })
    await injectScript(tab.id, {
        file: '/shader.js',
        allFrames: true
    })
    console.log('we did it')

    await injectScript(tab.id, {
        code: `setShader('${shaderScript}')`,
        allFrames: true
    })
})
