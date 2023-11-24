import { events } from "@/packages/eventbus"
import { ref, type ComputedRef, type Ref, type WritableComputedRef } from "vue"
// interface DragList {
//     [key: number | string]: {
//         top: number
//         left: number
//     }
// }
// interface LastSelect {
//     widht: number
//     height: number
// }
interface DragItem {
    top: number
    left: number
}
interface LineX {
    showLeft: number
    left: number
}
interface LineY {
    showTop: number
    top: number
}
interface Lines {
    x: LineX[]
    y: LineY[]
}
// interface StartList {
//     top: number
//     left: number
// }
export default function useWidgetDragger(
    data: WritableComputedRef<EditorData>,
    widgetList: ComputedRef<{
        focus: Widgets
        blurs: Widgets
    }>,
    lastSelectedWidget: ComputedRef<Widget>,
) {
    let dragState = {
        //拖动时鼠标的初始位置
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0,
        startPos: [] as DragItem[],
        lines: {} as Lines,
        dragging: false,
    }

    // 要显示的辅助线位置
    const markLineX = ref<number | null>(null)
    const markLineY = ref<number | null>(null)
    const mousemove = (e: MouseEvent) => {
        // 记录拖拽前的位置
        if (!dragState.dragging) {
            dragState.dragging = true
            events.emit("start")
        }
        // 事件绑定再document上面
        let { clientX: moveX, clientY: moveY } = e
        // 计算当前元素最新的left和top，去lines里面找辅助线
        const left = moveX - dragState.startX + dragState.startLeft
        const top = moveY - dragState.startY + dragState.startTop
        // 计算横线
        let y = null
        for (let i = 0; i < dragState.lines.y.length; i++) {
            const { top: t, showTop: s } = dragState.lines.y[i]
            if (Math.abs(t - top) < 5) {
                y = s
                moveY = dragState.startY - dragState.startTop + t
                break
            }
        }
        // 计算纵线
        let x = null
        for (let i = 0; i < dragState.lines.x.length; i++) {
            const { left: t, showLeft: s } = dragState.lines.x[i]
            if (Math.abs(t - left) < 5) {
                x = s
                moveX = dragState.startX - dragState.startLeft + t
                break
            }
        }
        markLineX.value = x
        markLineY.value = y
        // 鼠标的偏移量
        const durX = moveX - dragState.startX
        const durY = moveY - dragState.startY

        widgetList.value.focus.forEach((widget: Widget, i: number) => {
            widget.top = dragState.startPos[i].top + durY
            widget.left = dragState.startPos[i].left + durX
        })
    }
    const mouseup = () => {
        // 记录拖拽前的位置
        if (dragState.dragging) {
            dragState.dragging = false
            events.emit("end")
        }
        markLineX.value = null
        markLineY.value = null
        document.removeEventListener("mousemove", mousemove)
        document.removeEventListener("mouseup", mouseup)
    }
    const mousedown = (e: MouseEvent) => {
        const { width: Bwidth, height: Bheight } = lastSelectedWidget.value
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: lastSelectedWidget.value.left,
            startTop: lastSelectedWidget.value.top,
            startPos: widgetList.value.focus.map(({ top, left }) => ({
                top,
                left,
            })),
            dragging: false,
            lines: (() => {
                const { blurs: unFocused } = widgetList.value
                const lines = {
                    x: [] as any, //纵向辅助线
                    y: [] as any, //横向辅助线
                }
                ;[
                    ...unFocused,
                    {
                        top: 0,
                        left: 0,
                        width: data.value.container.width,
                        height: data.value.container.height,
                    },
                ].forEach((block) => {
                    const {
                        top: ATop,
                        left: ALeft,
                        width: AWidth,
                        height: AHeight,
                    } = block
                    lines.y.push({ showTop: ATop, top: ATop })
                    lines.y.push({ showTop: ATop, top: ATop - Bheight })
                    lines.y.push({
                        showTop: ATop + AHeight / 2,
                        top: ATop + AHeight / 2 - Bheight / 2,
                    })
                    lines.y.push({
                        showTop: ATop + AHeight,
                        top: ATop + AHeight,
                    })
                    lines.y.push({
                        showTop: ATop + AHeight,
                        top: ATop + AHeight - Bheight,
                    })

                    lines.x.push({
                        showLeft: ALeft,
                        left: ALeft,
                    })
                    lines.x.push({
                        showLeft: ALeft + AWidth,
                        left: ALeft + AWidth,
                    })
                    lines.x.push({
                        showLeft: ALeft + AWidth / 2,
                        left: ALeft + AWidth / 2 - Bwidth / 2,
                    })
                    lines.x.push({
                        showLeft: ALeft + AWidth,
                        left: ALeft + AWidth - Bwidth,
                    })
                    lines.x.push({
                        showLeft: ALeft,
                        left: ALeft - Bwidth,
                    })
                })
                console.log("lines: ", lines)

                return lines
            })(),
        }
        // console.log("newLines", lines)

        document.addEventListener("mousemove", mousemove)
        document.addEventListener("mouseup", mouseup)
    }
    return {
        mousedown,
        markLineX,
        markLineY,
    }
}
