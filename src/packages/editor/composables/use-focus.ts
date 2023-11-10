import { computed, ref, type WritableComputedRef } from "vue"

export default function useFocus(
    data: WritableComputedRef<EditorData>,
    cb: (e: MouseEvent) => void,
) {
    // 记录选中的widget以及选择的顺序，后续辅助线功能需要
    const focusList = ref<Set<number>>(new Set())
    // const selectIndex = ref(-1)
    const widgetList = computed(() => {
        const focus: Widgets = []
        const blurs: Widgets = []
        data.value.widgets.forEach((widget: Widget) =>
            (widget.focus ? focus : blurs).push(widget),
        )
        return { focus, blurs }
    })

    const clearWidgetFocus = () => {
        // widgetList.value.focus.forEach((widget) => {
        //     widget.focus = false
        // })
        focusList.value.forEach((i) => {
            data.value.widgets[i].focus = false
        })
        focusList.value.clear()
    }

    const widgetMouseDown = (e: MouseEvent, widget: Widget, ind: number) => {
        e.stopPropagation()
        e.preventDefault()
        if (e.shiftKey) {
            // if (widgetList.value.focus.length <= 1) {
            if (focusList.value.size <= 1) {
                widget.focus = true
                focusList.value.add(ind)
            } else {
                // widget.focus = !widget.focus
                if (widget.focus) {
                    widget.focus = false
                    focusList.value.delete(ind)
                } else {
                    widget.focus = true
                    focusList.value.add(ind)
                }
            }
        } else {
            if (!widget.focus) {
                clearWidgetFocus()
                widget.focus = true
                focusList.value.add(ind)
            }
            // else {
            //     widget.focus = false
            // }
        }
        console.log("widgetList", widgetList.value)

        cb(e)
    }
    return {
        clearWidgetFocus,
        widgetMouseDown,
        widgetList,
        focusList,
    }
}
