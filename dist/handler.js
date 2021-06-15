const { createApp, onMounted, reactive, computed, toRefs, ref, nextTick } = window.Vue
const GifViewer = window.GifViewer

const GIF_SOURCE = 'data:image/gif;base64,R0lGODlhQgBCAPf/AAAAAP39/fz8/P7+/tjY2Pv7+/f39wEBAfn5+QoKCgkJCQ0NDQQEBPr6+gsLCxkZGenp6fX19QICAhMTE9ra2vj4+N3d3e/v7wUFBQcHB9vb29/f397e3ubm5uTk5PHx8RQUFAMDA/Dw8Orq6vPz8+vr6+Hh4dzc3B4eHtLS0ujo6ODg4O3t7ZycnCMjI9TU1A8PD+zs7Hp6etXV1fb29kpKSktLS9PT0+Pj4/Ly8iAgIBISEhoaGg4ODsfHx3d3d1ZWVr29vR8fH+Xl5efn5zExMQgICAwMDCkpKcDAwBEREb+/v9HR0RUVFXBwcEFBQfT09E1NTcbGxsLCwh0dHZiYmJSUlKCgoI6OjqioqG1tbYyMjGJiYgYGBjo6OjQ0NCQkJBwcHBYWFsTExMXFxdnZ2bS0tD8/Py8vL6qqqoqKihcXF7e3t2dnZ1hYWF9fX1BQUCcnJ05OThAQEBsbG7W1tSoqKlNTU7KysiIiIpqamiEhIaysrHl5eX19fdfX18vLy0NDQyYmJuLi4qWlpXNzc9bW1ltbW5mZmYKCgjc3N5+fn4ODg3h4eJeXl4GBgZOTk25ubiwsLLGxsVVVVSgoKIeHhzU1NXR0dICAgMPDw8HBwVlZWT09PcrKyrOzsyUlJcnJye7u7qenp6urq66urlpaWoaGhpWVlZubm2hoaElJSUBAQH5+fru7u4uLi2BgYEdHRzk5OXZ2drm5uWlpaaKionFxcWFhYcjIyLi4uF5eXqampjs7OysrKzIyMkxMTEJCQnt7e2NjYz4+PqSkpG9vb3x8fJCQkBgYGLy8vJGRkX9/fzw8PERERE9PT3Jycp6eno+Pjy4uLs3NzaGhoUVFRVFRUaOjo76+vq+vr1JSUpaWlmxsbISEhGZmZmVlZTY2NjMzM4WFhYmJiS0tLWpqakZGRkhISDg4OK2trWtra1RUVLa2tlxcXNDQ0MzMzM/Pz2RkZF1dXZKSkjAwMKmpqbCwsLq6uoiIiFdXV42Njc7OznV1df///////yH/C05FVFNDQVBFMi4wAwEfAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQzRDODVGRjU0QUIxMUU3OEJCQjhDNzVGMjAzQjI4MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQzRDODYwMDU0QUIxMUU3OEJCQjhDNzVGMjAzQjI4MyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRDNEM4NUZENTRBQjExRTc4QkJCOEM3NUYyMDNCMjgzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRDNEM4NUZFNTRBQjExRTc4QkJCOEM3NUYyMDNCMjgzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMy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'
// const GIF_SOURCE = 'data:image/gif;base64,R0lGODlhCgAKAJEAAP////8AAAAA/wAAACH5BAAAAAAALAAAAAAKAAoAAAIWjC2Zhyoc3DOgAnXslfqo3mCMBJFMAQA7'
// const GIF_SOURCE = 'data:image/gif;base64,R0lGODlhMgAyAPYAALoNA70MA7oPBa0ME6kNFLocEroeFKseIsEMA9EHAdgHAdoHAdgHAtAIAdEIAdEJAdIJAdAIAtAJAtEJAsEHEcAIEcEJEtEZEdIYEdEYEtAZEtEZEv8AABQNqRMMrQMNugUPugMMvRIcuhQeuiIeqwMMwREHwREIwBIJwQEH0QEI0AEI0QEJ0QII0AIJ0AIJ0QEJ0gEH2AIH2AEH2hEZ0RIZ0BIY0RIZ0REY0gAA/7qkmpqkurqzqbizq6uzuKmzurrEutDHwNDHwdDIwdHIwdHJwsDH0MHH0MHI0MHI0cLJ0dDX0NHY0NDY0dHY0dLZ0dHZ0v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAyADIAAAf+gAgMDAoBAQqEhoiFh4mNCwMeMzIxISExlJaYlZeZnTIlDByjEhKjHKWnqaSmoxYoObEuLrE5s7W3srSxMqKsqq2owascr7i7tsi5ybW9wM+/0cWwusfW1bwBExITAADb3d/c3uDkEhAEHTAuLx8fL+zu8O3v8fUvIdrj4uHl/Obo1NmbJ2+gQXy+hEFTKM0YNmYPlzmTRqxiMIcQMy6TmNDiQmIYNyob2Uxfv33+Up5Lt44ewXsFXbLLp/KkTYAsD8bceS9Ex2FAF4YkGRHZRIZIPbqippFoxqNKUUU41aDBqQonaqlQUauFU4kmzdkUUGCDhgwGDGTQgOEACRz+NWyMGGGjxg0RIF7qnRn2nzgHBXQUEUKEBw8ihHv4SHIkyY8fjJXsELFCZ8+fCzUMicK5SRPOUZowAc1kNGckNa49xSxNgxDQS5bAls05NugjqYs2Y43U9ezftWlHwa0abE1zCQzwgLLECRAgTpo/j+4c+pInP0aksDyPJsrvyZdLt16d+vTr2bfLXO/zYzDfwYFHsc2ZuG5evInBny+cPv/buTXVjAKnPPBAgQeOckEQ8vnnnxE01MICCxJSGEsMA1igIQEEaGgBhxpScEAPzJU3nnnWPeEDCSaggEIHHbj4YowueuCBjDDiSKMJJPjwxIlAmghFDwdQsGGHR3r+OEAMFTYZCw1GNNifcEFcgOCVoyggQ3HI1HCElPIJoYF7pzCw5X05eAlmfJyJSeYoDISwl0wpjPDDjybmeR4UPBiQwHc2BSAndy7UeWeQ5wnZ55838RPAmQLGoiab/1HqJkXBmMllLZNW6ql/lyaVKaQicYoEaaZFwcRnnbEaxRBjYlrmoOsVtIIIOyjR2GOMJeFDD4gVdpgQRehQgAOAiiXonDGBIMINcc1VFw4kHIDBWWmttUEBAhznKKlftaAVV7GcUAFVVo0SQVDSaIpmqbGgYMGbopYJ7qYPyUtvVHEyC9O/8MDQAQEQJOtXTcsSWms9AhNssLfgPIpvpDlZ6CvrxRy4SzG8Fc+LMb/3vouMxfVi3K/CPAU8cMGNQsxNwgv7q7LDLT/8csgbj+xxyTxrzDHHJEcF8sRA7yw0uxmXIIMnm2jC9NMzeDDAAo4sokjVWDOAQCAAOw=='

const app = createApp({
  template: `
    <header>
      <h3>GIF Viewer</h3>
    </header>
    <main>
      <div class="row row-start">

        <div class="panel none-flex">
          <div class="row-between">
            <p class="panel-header">GIF</p>
            <span class="panel-parse">{{ time }}</span>
          </div>
          <div class="panel-content center gif-wrap" @click="file.click()">
            <input type="file" ref="file" style="display: none" accept="image/gif" @change="handleFileChange">
            <img class="gif-example" ref="img" :src="source" alt="">
          </div>
        </div>

        <div class="panel none-flex">
          <p class="panel-header">基本信息</p>
          <div class="panel-content">
            <div class="panel-row">
              <span>版本:</span>
              <p>{{ gif?.header?.version }}</p>
            </div>

            <div class="panel-row">
              <span>大小:</span>
              <p>{{ fileSize }}</p>
            </div>

             <div class="panel-row">
              <span>分辨率:</span>
              <p>{{ gif?.logicalScreenDescriptor?.width }} x {{ gif?.logicalScreenDescriptor?.height }}</p>
            </div>

            <div class="panel-row">
              <span>子图像数:</span>
              <p>{{ gif?.images?.length }}</p>
            </div>

            <div class="panel-row">
              <span>色彩数目:</span>
              <p>{{ gif?.globalColorTable?.colors?.length }}</p>
            </div>
          </div>
        </div>

        <div class="panel none-flex">
          <p class="panel-header">全局色彩表</p>
          <div class="panel-content center">
            <color-table v-if="gif?.globalColorTable?.colors" :colors="gif?.globalColorTable?.colors" />
          </div>
        </div>

        <div class="panel panel-double">
          <p class="panel-header">逻辑屏幕描述符</p>
          <div class="row-between full">
            <div class="panel-content">
              <div class="panel-row">
                <span>宽度:</span>
                <p>{{ gif?.logicalScreenDescriptor?.width }}</p>
              </div>

               <div class="panel-row">
                <span>高度:</span>
                <p>{{ gif?.logicalScreenDescriptor?.height }}</p>
              </div>

              <div class="panel-row">
                <span>像素比:</span>
                <p>{{ gif?.logicalScreenDescriptor?.pixelAspectRatio }}</p>
              </div>

              <div class="panel-row">
                <span>背景颜色索引:</span>
                <p>{{ gif?.logicalScreenDescriptor?.backgroundColorIndex }}</p>
              </div>

              <div class="panel-row">
                <span>全局色彩表标识:</span>
                <p>{{ gif?.logicalScreenDescriptor?.packedField?.globalColorTableFlag }}</p>
              </div>

            </div>
            <div class="panel-content">

              <div class="panel-row">
                <span>全局色彩表大小:</span>
                <p>{{ gif?.logicalScreenDescriptor?.packedField?.globalColorTableSize }}</p>
              </div>

              <div class="panel-row">
                <span>排序规则:</span>
                <p>{{ gif?.logicalScreenDescriptor?.packedField?.sortFlag }}</p>
              </div>

              <div class="panel-row">
                <span>色彩分辨率:</span>
                <p>{{ gif?.logicalScreenDescriptor?.packedField?.colorResolution }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="row row-start">

        <div
          class="panel none-flex"
          v-for="(extension, index) of gif?.extensions"
          :key="index"
         >
          <p class="panel-header">扩展</p>
          <div class="panel-content">
            <div class="panel-row">
              <span>类型:</span>
              <p>{{ extension.name }}</p>
            </div>

            <div class="panel-row" v-if="extension?.application?.identifier">
              <span>标识:</span>
              <p>{{ extension?.application?.identifier }}</p>
            </div>

             <div class="panel-row" v-if="extension?.application?.authentication">
              <span>鉴别码:</span>
              <p>{{ extension?.application?.authentication }}</p>
            </div>

            <div class="panel-row" v-if="extension?.application?.version === 'NETSCAPE2.0'">
              <span>循环次数:</span>
              <p>{{ extension?.application?.to === 0 ? 'Infinity' : extension?.application?.to }}</p>
            </div>

            <div class="panel-row" v-if="extension.transparentColorIndex">
              <span>透明颜色索引:</span>
              <p>{{ extension.transparentColorIndex }}</p>
            </div>

            <div class="panel-row" v-if="extension.delayTime">
              <span>延迟时间:</span>
              <p>{{ extension.delayTime }}</p>
            </div>

            <div class="panel-row" v-if="extension.comment">
              <span>评论:</span>
              <p>{{ extension.comment }}</p>
            </div>
          </div>
        </div>

      </div>

      <div class="row-start">
        <div
          v-for="(image, index) of gif?.images"
          :key="index"
          class="panel-image"
         >
          <div class="panel none-flex">
            <p class="panel-header">子图像 - {{ index + 1 }}</p>
            <div class="panel-content center">
              <sub-image :image="image"></sub-image>
            </div>
          </div>

          <div class="panel none-flex">
            <p class="panel-header">图像描述符</p>
            <div class="panel-content">
              <div class="panel-row">
                <span>水平偏移:</span>
                <p>{{ image?.imageDescriptor?.left }}</p>
              </div>

              <div class="panel-row">
                <span>垂直偏移:</span>
                <p>{{ image?.imageDescriptor?.top }}</p>
              </div>

               <div class="panel-row">
                <span>宽度:</span>
                <p>{{ image?.imageDescriptor?.width }}</p>
              </div>

              <div class="panel-row">
                <span>高度:</span>
                <p>{{ image?.imageDescriptor?.height }}</p>
              </div>

              <div class="panel-row">
                <span>本地色彩表标识:</span>
                <p>{{ image?.imageDescriptor?.packedField?.localColorTableFlag }}</p>
              </div>

              <div class="panel-row">
                <span>扫描标识:</span>
                <p>{{ image?.imageDescriptor?.packedField?.interlaceFlag }}</p>
              </div>

              <div class="panel-row">
                <span>分类标志:</span>
                <p>{{ image?.imageDescriptor?.packedField?.sortFlag }}</p>
              </div>

              <div class="panel-row">
                <span>保留位:</span>
                <p>{{ image?.imageDescriptor?.packedField?.reserved }}</p>
              </div>

              <div class="panel-row">
                <span>本地色彩表大小:</span>
                <p>{{ image?.imageDescriptor?.packedField?.localColorTableSize }}</p>
              </div>
            </div>
          </div>
          <div class="panel none-flex" v-if="image.graphicsControlExtension">
            <p class="panel-header">图像控制扩展</p>
            <div class="panel-content">

              <div class="panel-row">
                <span>延时时间:</span>
                <p>{{ image?.graphicsControlExtension?.delayTime / 1000 }} s</p>
              </div>

              <div class="panel-row">
                <span>透明颜色索引:</span>
                <p>{{ image?.graphicsControlExtension?.transparentColorIndex }}</p>
              </div>

              <div class="panel-row">
                <span>保留位:</span>
                <p>{{ image?.graphicsControlExtension?.packedField?.reserved }}</p>
              </div>

               <div class="panel-row">
                <span>处置方法:</span>
                <p>{{ image?.graphicsControlExtension?.packedField?.disposalMethod }}</p>
              </div>

              <div class="panel-row">
                <span>用户输入标识:</span>
                <p>{{ image?.graphicsControlExtension?.packedField?.userInputFlag }}</p>
              </div>

              <div class="panel-row">
                <span>透明颜色标识:</span>
                <p>{{ image?.graphicsControlExtension?.packedField?.transparentColorFlag }}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  setup () {
    const state = reactive({
      gifViewer: new GifViewer(),
      source: GIF_SOURCE,
      img: null,
      file: null,
      gif: null,
      globalColorTable: null,
      time: 0
    })

    const fileSize = computed(() => {
      if (!state?.gif?.byteLength) return ''
      return state.gif?.byteLength < 1024 ? `${state.gif?.byteLength} b` : `${Math.round(state.gif?.byteLength / 1024)} kb`
    })

    const decode = async (file) => {
      const t1 = performance.now()
      state.gif = await state.gifViewer.decode(file)
      const t2 = performance.now()
      state.time = (t2 - t1) < 1000 ? `${(t2 - t1).toFixed(2)} ms` : `${((t2 - t1) / 1000).toFixed(2)} s`
      console.log(state.gif)
    }

    const handleFileChange = ({ target: { files } }) => {
      const [file] = files
      state.gif = null
      state.source = URL.createObjectURL(file)
      nextTick(async () => {
        await decode(file)
      })
    }

    onMounted(async () => {
      const buffer = await (await fetch(GIF_SOURCE)).arrayBuffer()
      await decode(buffer)
    })

    return {
      ...toRefs(state),
      fileSize,
      handleFileChange
    }
  }
})

app.component('color-table', {
  template: `
    <canvas ref="canvas"></canvas>
  `,
  props: {
    colors: null
  },
  setup (props) {
    const canvas = ref(null)
    const { colors } = toRefs(props)

    onMounted(() => {
      canvas.value.width = 128
      canvas.value.height = 128
      const ctx = canvas.value.getContext('2d')
      ctx.clearRect(0, 0, 128, 128)
      colors.value?.forEach((color, index) => {
        const column = Math.floor(index * 8 / 128)
        const row = (index * 8) % 128
        const { r, g, b} = color
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fillRect(row, column * 8, 8, 8);
      })
    })

    return {
      canvas
    }
  }
})

app.component('sub-image', {
  template: `
    <canvas ref="canvas"></canvas>
  `,
  props: {
    image: null
  },
  setup (props) {
    const canvas = ref(null)
    const { image } = toRefs(props)
    const MAX_WIDTH = 208
    const {
      imageDescriptor: { packedField: { interlaceFlag }, width, height },
      imageData: { colors }
    } = image.value

    onMounted(() => {
      canvas.value.width = width
      canvas.value.height = height
      const ctx = canvas.value.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      colors.forEach((color, index) => {
        const column = Math.floor(index / width)
        const row = index % height
        const { r, g, b, a} = color
        if (interlaceFlag === 0) {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
          ctx.fillRect(row, column, 1, 1)
        } else {
          console.log('interlaceFlag: ', interlaceFlag)
        }
      })

      if (width > MAX_WIDTH) {
        canvas.value.style.transform = `scale(${MAX_WIDTH / width})`
      }
    })

    return {
      canvas
    }
  }
})

app.mount('#app')
