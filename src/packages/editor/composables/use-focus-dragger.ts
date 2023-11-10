import { ref, type ComputedRef, type Ref, type WritableComputedRef } from "vue"
interface DragList {
    [key: number | string]: {
        top: number
        left: number
    }
}
interface LastSelect {
    widht: number
    height: number
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
export default function useFocusDragger(
    data: WritableComputedRef<EditorData>,
    widgetList: ComputedRef<{
        focus: Widgets
        blurs: Widgets
    }>,
    focusList: Ref<Set<number>>,
) {
    let dragState = {
        //拖动时鼠标的初始位置
        startX: 0,
        startY: 0,
        //拖动时widget的初始位置
        startLeft: 0,
        startTop: 0,
    }
    // 最后选择widget 的宽高
    let lastSelect = {} as LastSelect
    // 辅助线
    let lines: Lines
    // 要显示的辅助线位置
    const markLineX = ref<number | undefined>()
    const markLineY = ref<number | undefined>()
    // 选中的widget的left top信息
    const dragList = {} as DragList
    const mousemove = (e: MouseEvent) => {
        let { clientX, clientY } = e

        // 计算当前元素最新的left top 去线里面找，有对应的就显示
        // 鼠标移动后 - 鼠标移动前 +left
        const left = clientX - dragState.startX + dragState.startLeft
        const top = clientY - dragState.startY + dragState.startTop
        // 距离参照物小于5像素就显示线
        let yline: number | undefined
        for (let i = 0, len = lines.y.length; i < len; i++) {
            const { top: t, showTop: s } = lines.y[i]
            if (Math.abs(t - top) < 5) {
                yline = s
                // 实现快速贴边
                clientY = dragState.startY - dragState.startTop + t
                break
            }
        }
        let xline: number | undefined
        for (let i = 0, len = lines.x.length; i < len; i++) {
            const { left: l, showLeft: s } = lines.x[i]
            if (Math.abs(l - left) < 5) {
                xline = s
                // 实现快速贴边
                clientX = dragState.startX - dragState.startLeft + l
                break
            }
        }
        markLineX.value = xline
        markLineY.value = yline
        const x = clientX - dragState.startX
        const y = clientY - dragState.startY
        // widgetList.value.focus.forEach((widget: Widget, i: number) => {
        //     widget.top = dragState.startList[i].top + y
        //     widget.left = dragState.startList[i].left + x
        // })
        focusList.value.forEach((i: number) => {
            const widget = data.value.widgets[i]
            widget.top = dragList[i].top + y
            widget.left = dragList[i].left + x
        })
    }
    const mouseup = () => {
        document.removeEventListener("mousemove", mousemove)
        document.removeEventListener("mouseup", mouseup)
    }
    const mousedown = (e: MouseEvent) => {
        // 计算取出最后一个set元素也就是最后操作的widget
        let index = 0
        // 去除响应式影响，不然拖动计算会累加出错
        focusList.value.forEach((i: number) => {
            dragList[i] = {
                top: data.value.widgets[i].top,
                left: data.value.widgets[i].left,
            }
            if (focusList.value.size - 1 == index) {
                lastSelect = {
                    widht: data.value.widgets[i].width,
                    height: data.value.widgets[i].height,
                }
            }
            index++
        })
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: data.value.widgets[index].left,
            startTop: data.value.widgets[index].top,
            // startList: widgetList.value.focus.map(({ top, left }) => ({
            //     top,
            //     left,
            // })),
        }
        // 获取没有选中的，以他们位置做辅助线
        lines = (() => {
            const { blurs } = widgetList.value
            const newLines: Lines = {
                x: [], //存纵向的线
                y: [], //存横向的线
            }
            blurs.forEach((widget) => {
                const {
                    top: blursTop,
                    left: blursLeft,
                    width: blursWidth,
                    height: blursHeight,
                } = widget
                // 拖拽元素top值为top时需要显示横线
                // 线的位置showTop
                // 顶对顶
                newLines.y.push({ showTop: blursTop, top: blursTop })
                // 顶对底
                newLines.y.push({
                    showTop: blursTop,
                    top: blursTop - lastSelect.height,
                })
                // 中对中
                newLines.y.push({
                    showTop: blursTop + blursHeight / 2,
                    top: blursTop + blursHeight / 2 - lastSelect.height / 2,
                })
                // 底对顶
                newLines.y.push({
                    showTop: blursTop + blursHeight,
                    top: blursTop + blursHeight,
                })
                // 底对底
                newLines.y.push({
                    showTop: blursTop + blursHeight,
                    top: blursTop + blursHeight - lastSelect.height,
                })

                // 左对左
                newLines.x.push({
                    showLeft: blursLeft,
                    left: blursLeft,
                })
                // 左对右
                newLines.x.push({
                    showLeft: blursLeft + blursWidth,
                    left: blursLeft + blursWidth,
                })
                // 中对中
                newLines.x.push({
                    showLeft: blursLeft + blursWidth / 2,
                    left: blursLeft + blursWidth / 2 - lastSelect.widht / 2,
                })
                // 右对右
                newLines.x.push({
                    showLeft: blursLeft + blursWidth,
                    left: blursLeft + blursWidth - lastSelect.widht,
                })
                // 右对左
                newLines.x.push({
                    showLeft: blursLeft,
                    left: blursLeft - lastSelect.widht,
                })
            })
            return newLines
        })()
        console.log("newLines", lines)

        document.addEventListener("mousemove", mousemove)
        document.addEventListener("mouseup", mouseup)
    }
    return {
        mousedown,
        markLineX,
        markLineY,
    }
}