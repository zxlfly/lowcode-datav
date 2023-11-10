import { defineComponent, computed, provide, ref, type PropType } from "vue"
import "./editor.scss"
import { registerConfig as config } from "@/utils/editor-config"
import { EditorKey } from "./editor.type"
import EditorWidget from "../editor-widget/editor-widget"
import useMenuDragHandle from "./composables/use-menu-drag-handle"
import useFocus from "./composables/use-focus"
import useFocusDragger from "./composables/use-focus-dragger"
export default defineComponent({
    name: "Editor",
    directives: {},
    props: {
        modelValue: {
            type: Object as PropType<EditorData>,
            request: true,
            default: null,
        },
    },
    emits: ["update:modelValue"],
    setup(props, ctx) {
        provide(EditorKey, config)
        const data = computed({
            get() {
                return props.modelValue
            },
            set(newValue) {
                ctx.emit("update:modelValue", newValue)
            },
        })
        const canvasStyle = computed(() => ({
            width: data.value.container.width + "px",
            height: data.value.container.height + "px",
        }))
        const canvasRef = ref<HTMLDivElement | null>(null)
        const { dragStart, dragend } = useMenuDragHandle(canvasRef, data)
        // 选中操作，选中完成之后需要传入拖拽的回调来实现拖拽更新布局
        const { clearWidgetFocus, widgetMouseDown, widgetList, focusList } =
            useFocus(data, (e) => mousedown(e))
        const { mousedown, markLineX, markLineY } = useFocusDragger(
            data,
            widgetList,
            focusList,
        )
        const updateWidget = (val: Array<any>) => {
            data.value.widgets[val[1]] = val[0]
        }
        return () => {
            return (
                <div class="editor">
                    <div class="editor-materials">
                        {config.componentList.map((comp) => (
                            <div
                                class="editor-materials-item"
                                draggable
                                onDragstart={(e) => dragStart(e, comp)}
                                onDragend={dragend}
                            >
                                <div class="editor-materials-item-label">
                                    {comp.label}
                                </div>
                                <div class="editor-materials-item-cont">
                                    {comp.preview()}
                                </div>
                                <div class="editor-materials-item-after"></div>
                            </div>
                        ))}
                    </div>
                    <div class="editor-actions">actions</div>
                    <div class="editor-attrs">attrs</div>
                    <div class="editor-container">
                        <div
                            ref={canvasRef}
                            style={canvasStyle.value}
                            class="editor-container-canvas"
                            onMousedown={clearWidgetFocus}
                        >
                            {data.value.widgets.map(
                                (item: any, ind: number) => {
                                    return (
                                        <EditorWidget
                                            key={ind}
                                            class={
                                                item.focus
                                                    ? "editor-widget-focus"
                                                    : ""
                                            }
                                            onUpdateWidget={updateWidget}
                                            widget={item}
                                            onMousedown={(e: MouseEvent) =>
                                                widgetMouseDown(e, item, ind)
                                            }
                                            index={ind}
                                        />
                                    )
                                },
                            )}
                            {markLineX.value !== undefined && (
                                <div
                                    class="mark-line-x"
                                    style={{ left: markLineX.value + "px" }}
                                ></div>
                            )}
                            {markLineY.value !== undefined && (
                                <div
                                    class="mark-line-y"
                                    style={{ top: markLineY.value + "px" }}
                                ></div>
                            )}
                        </div>
                    </div>
                </div>
            )
        }
    },
})
