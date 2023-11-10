declare interface Widget {
    init: boolean
    top: number
    left: number
    zIndex: number
    key: string
    focus: boolean
    needAlignCenter: boolean
    width: number
    height: number
}
declare type Widgets = Array<Widget>
declare type RegisterCompConfig = {
    label: string
    preview: any
    render: any
    key: string
}
declare type EditorConfig = {
    componentList: Array<RegisterCompConfig>
    componentMap: Record<string, any>
    register: (component: RegisterCompConfig) => void
}
declare type EditorData = {
    container: {
        width: number
        height: number
    }
    widgets: Widgets
}
