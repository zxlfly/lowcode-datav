import { defineComponent, computed, provide, ref, type PropType } from "vue"
import "./editor.scss"
import { registerConfig as config } from "@/utils/editor-config"
import { EditorKey } from "./editor.type"
import EditorWidget from "../editor-widget/editor-widget"
import useMenuDragHandle from "./composables/use-menu-drag-handle"
import useFocus from "./composables/use-focus"
import useWidgetDragger from "./composables/use-widget-dragger"
import useCommand from "./composables/use-commands"
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
        const {
            clearWidgetFocus,
            widgetMouseDown,
            widgetList,
            lastSelectedWidget,
        } = useFocus(data, (e) => mousedown(e))
        const { mousedown, markLineX, markLineY } = useWidgetDragger(
            data,
            widgetList,
            lastSelectedWidget,
        )
        const updateWidget = (val: Array<any>) => {
            data.value.widgets[val[1]] = val[0]
        }
        const { commands } = useCommand(data)
        const cancel = () => {
            commands.undo()
        }
        const reset = () => {
            commands.redo()
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
                    <div class="editor-actions">
                        <div onClick={cancel} class="editor-actions-btn">
                            撤销
                        </div>
                        <div onClick={reset} class="editor-actions-btn">
                            重做
                        </div>
                    </div>
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
                            {markLineX.value !== null && (
                                <div
                                    class="mark-line-x"
                                    style={{ left: markLineX.value + "px" }}
                                ></div>
                            )}
                            {markLineY.value !== null && (
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
