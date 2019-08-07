class ShaderToy {
  constructor() {
    const canvas = document.querySelector('#glcanvas')
    const vid = document.querySelector('video')

    this.mVideo = vid

    this.mCanvas = canvas
    this.mGLContext = canvas.getContext('webgl2')
    this.mFPS = piCreateFPSCounter()

    this.mTOffset = 0;
    this.mTo = 0;
    this.mTf = 0;

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
      // transform api output to shadertoy input
      const renderpasses = jsn.renderpass
      for (let i = 0; i < renderpasses.length; i++) {
        const renderpass = renderpasses[i]
        const inputs = renderpass.inputs
        for (let j = 0; j < inputs.length; j++) {
          const input = inputs[j]
          input.type = input.ctype

          if (input.type === 'video') {
            input.video = this.mVideo
            input.sampler = {
              filter: 'linear',
              internal: 'byte',
              srgb: 'false',
              vflip: 'true',
              wrap: 'clamp'
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
    
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

      me.mIsPaused = me.mVideo.paused; // SAM EDIT
      me.mEffect.SetSamplerVFlip(0, 0, 'true');

      me.mEffect.RequestAnimationFrame(renderLoop2)

      if (me.mIsPaused && !me.mForceFrame) {
        // me.mEffect.UpdateInputs(me.mActiveDoc, false)
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

    const video = document.querySelector('video')
    // const tex = initTexture(gl)
    // updateTexture(gl, tex, video)

    // TODO: see EffectPass.prototype.NewTexture, find a way to make it use an existing video object
    this.mEffect.NewTexture(0, 0, { mType: 'video', video, mSampler: {} })
  }
}

gShadertoy = new ShaderToy()

function setShader(json) {
  console.log('SHADER', json)
  gShadertoy.dataLoadShader(json)
  gShadertoy.updateTexture()
}
