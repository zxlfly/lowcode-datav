import {
    computed,
    defineComponent,
    inject,
    onMounted,
    ref,
    type PropType,
} from "vue"
import "./style.scss"
import { EditorKey } from "../editor/editor.type"
import { cloneDeep } from "lodash-es"

export default defineComponent({
    name: "EditorWidget",
    directives: {},
    props: {
        widget: {
            type: Object as PropType<Widget>,
            request: true,
            default: null,
        },
        index: {
            type: Number,
            request: true,
            default: -1,
        },
    },
    emits: ["updateWidget"],
    setup(props, ctx) {
        const config = inject(EditorKey)
        const blockRef = ref<HTMLDivElement | null>(null)
        const blockStyle = computed(() => ({
            top: props.widget.top + "px",
            left: props.widget.left + "px",
            zIndex: props.widget.zIndex,
        }))
        onMounted(() => {
            if (blockRef.value === null) {
                return
            }
            // 渲染之后通过元素对象获取宽高
            const { offsetWidth, offsetHeight } = blockRef.value
            if (props.widget.init) {
                console.log("初始化渲染，更新宽高")
                ctx.emit("updateWidget", [
                    {
                        ...cloneDeep(props.widget),
                        width: offsetWidth,
                        height: offsetHeight,
                        init: false,
                    },
                    props.index,
                ])
            } else if (props.widget.needAlignCenter) {
                // 然组件渲染的时候以鼠标中心点为中心渲染
                ctx.emit("updateWidget", [
                    {
                        ...cloneDeep(props.widget),
                        left: props.widget.left - offsetWidth / 2,
                        top: props.widget.top - offsetHeight / 2,
                        needAlignCenter: false,
                        width: offsetWidth,
                        height: offsetHeight,
                    },
                    props.index,
                ])
            }
        })

        return () => {
            const comp = config?.componentMap[props.widget.key]
            return (
                <div
                    ref={blockRef}
                    class="editor-block"
                    style={blockStyle.value}
                >
                    {comp.render()}
                </div>
            )
        }
    },
})
