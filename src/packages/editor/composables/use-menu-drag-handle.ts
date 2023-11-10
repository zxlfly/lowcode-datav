import type { Ref, WritableComputedRef } from "vue"
let currentComp: RegisterCompConfig | null = null
export default function useMenuDragHandle(
    canvasRef: Ref<HTMLDivElement | null>,
    data: WritableComputedRef<Record<string, any>>,
) {
    const dragStart = (e: DragEvent, comp: RegisterCompConfig) => {
        /**
         * dragenter 进入 添加移动标识
         * dragover 内部移动 需要阻止默认行为否则不能触发drop
         * dragleave 离开 增加禁用表示标识
         * drop 放手 根据拖拽组件 添加组件
         */
        currentComp = comp
        canvasRef.value?.addEventListener("dragenter", dragenter)
        canvasRef.value?.addEventListener("dragover", dragover)
        canvasRef.value?.addEventListener("dragleave", dragleave)
        canvasRef.value?.addEventListener("drop", drop)
    }
    const dragend = () => {
        canvasRef.value?.removeEventListener("dragenter", dragenter)
        canvasRef.value?.removeEventListener("dragover", dragover)
        canvasRef.value?.removeEventListener("dragleave", dragleave)
        canvasRef.value?.removeEventListener("drop", drop)
    }
    const dragenter = (e: DragEvent) => {
        e.dataTransfer!.dropEffect = "move"
    }
    const dragover = (e: DragEvent) => {
        e.preventDefault()
    }
    const dragleave = (e: DragEvent) => {
        e.dataTransfer!.dropEffect = "none"
    }
    const drop = (e: DragEvent) => {
        data.value.widgets.push({
            top: e.offsetY,
            left: e.offsetX,
            zIndex: 1,
            key: currentComp!.key,
            needAlignCenter: true, //第一次拖入的时候居中
        })
        currentComp = null
    }
    return { dragStart, dragend }
}
