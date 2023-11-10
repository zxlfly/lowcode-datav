// 列表区域可展示的所有物料
// 可以对应组件的映射关系
import { ElButton, ElInput } from "element-plus"

function createEditorConfig() {
    const componentList: Array<RegisterCompConfig> = []
    const componentMap: Record<string, any> = {}
    return {
        componentList,
        componentMap,
        register: (component: RegisterCompConfig) => {
            componentList.push(component)
            componentMap[component.key] = component
        },
    }
}
export const registerConfig = createEditorConfig()
registerConfig.register({
    label: "文本",
    preview: () => "预览文本",
    render: () => "渲染文本",
    key: "text",
})
registerConfig.register({
    label: "按钮",
    preview: () => <ElButton>预览</ElButton>,
    render: () => <ElButton>渲染</ElButton>,
    key: "button",
})
registerConfig.register({
    label: "输入框",
    preview: () => <ElInput placeholder="预览输入" />,
    render: () => <ElInput placeholder="渲染输入" />,
    key: "input",
})
