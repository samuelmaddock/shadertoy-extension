class ShaderToy {
  constructor() {
    const createCanvas = () => {
      const e = document.createElement('canvas')
      e.id = 'glcanvas'
      e.setAttribute(
        'style',
        `
                position: fixed;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                opacity: 0.8;
                pointer-events: none;
                `
      )
      document.body.appendChild(e)
      return e
    }

    const canvas = document.querySelector('#glcanvas') || createCanvas()
    const vid = document.querySelector('video')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    this.mCanvas = canvas
    this.mGLContext = canvas.getContext('webgl2')
    this.mFPS = piCreateFPSCounter()

    this.mEffect = new Effect(
      this.mVR,
      this.mAudioContext,
      this.mGLContext,
      this.mCanvas.width,
      this.mCanvas.height,
      this.RefreshTexturThumbail,
      this,
      false,
      false
    )

    if (!this.mEffect.mCreated) {
      console.log('effect not created')
      this.mIsPaused = true
      this.mForceFrame = false
      this.mCreated = false
      return
    }
  }

  newScriptJSON(jsn) {
    try {
      var res = this.mEffect.newScriptJSON(jsn)

      this.resetTime()

      this.mInfo = jsn.info

      return {
        mDownloaded: true,
        mFailed: res.mFailed,
        mDate: jsn.info.date,
        mViewed: jsn.info.viewed,
        mName: jsn.info.name,
        mUserName: jsn.info.username,
        mDescription: jsn.info.description,
        mLikes: jsn.info.likes,
        mPublished: jsn.info.published,
        mHasLiked: jsn.info.hasliked,
        mTags: jsn.info.tags
      }
    } catch (e) {
      console.log(e)
      return { mDownloaded: false }
    }
  }

  setCompilationTime() {}
  pauseTime() {}
  resetTime() {}

  startRendering() {
    this.mIsRendering = true
    var me = this

    function renderLoop2() {
      if (me.mGLContext == null) return

      me.mEffect.RequestAnimationFrame(renderLoop2)

      if (me.mIsPaused && !me.mForceFrame) {
        me.mEffect.UpdateInputs(me.mActiveDoc, false)
        return
      }
      me.mForceFrame = false

      var time = getRealTime()

      var ltime = 0.0
      var dtime = 0.0
      if (me.mIsPaused) {
        ltime = me.mTf
        dtime = 1000.0 / 60.0
      } else {
        ltime = me.mTOffset + time - me.mTo
        if (me.mRestarted) dtime = 1000.0 / 60.0
        else dtime = ltime - me.mTf
        me.mTf = ltime
      }
      me.mRestarted = false

      var newFPS = me.mFPS.Count(time)

      me.mEffect.Paint(
        ltime / 1000.0,
        dtime / 1000.0,
        me.mFPS.GetFPS(),
        me.mMouseOriX,
        me.mMouseOriY,
        me.mMousePosX,
        me.mMousePosY,
        me.mIsPaused
      )
    }

    renderLoop2()
  }

  dataLoadShader(jsnShader) {
    const gRes = this.newScriptJSON(jsnShader)
    if (gRes.mDownloaded == false) return

    this.setCompilationTime()
    if (!gRes.mFailed) {
      this.startRendering()
      this.resetTime()
    } else {
      if (this.mIsRendering) this.pauseTime()
    }
  }

  updateTexture() {
    // const gl = this.mGLContext

    // function initTexture(gl) {
    //   const texture = gl.createTexture()
    //   gl.bindTexture(gl.TEXTURE_2D, texture)
  
    //   // Because video havs to be download over the internet
    //   // they might take a moment until it's ready so
    //   // put a single pixel in the texture so we can
    //   // use it immediately.
    //   const level = 0
    //   const internalFormat = gl.RGBA
    //   const width = 1
    //   const height = 1
    //   const border = 0
    //   const srcFormat = gl.RGBA
    //   const srcType = gl.UNSIGNED_BYTE
    //   const pixel = new Uint8Array([0, 0, 255, 255]) // opaque blue
    //   gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel)
  
    //   // Turn off mips and set  wrapping to clamp to edge so it
    //   // will work regardless of the dimensions of the video.
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  
    //   return texture
    // }
  
    // //
    // // copy the video texture
    // //
    // function updateTexture(gl, texture, video) {
    //   const level = 0
    //   const internalFormat = gl.RGBA
    //   const srcFormat = gl.RGBA
    //   const srcType = gl.UNSIGNED_BYTE
    //   gl.bindTexture(gl.TEXTURE_2D, texture)
    //   gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video)
    // }

    // const video = document.querySelector('video')
    // const tex = initTexture(gl)
    // updateTexture(gl, tex, video)
  }
}

gShadertoy = new ShaderToy()

function setShader(json) {
  gShadertoy.dataLoadShader(json)
}
