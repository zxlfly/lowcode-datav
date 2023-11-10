/**
 * {
        "container": {
            "width": 500,//画布宽度
            "height": 500//画布高度
        },
        "widgets": [
            {
                "top": 100, // 距离画布顶部的距离
                "left": 100,// 距离画布左边的距离
                "zIndex": 1,// 画布中渲染的层级
                "key": "text",// 渲染的组件类型
                "focus": false,// 是否被选中
                "needAlignCenter": false // 第一次拖入渲染的时候，为true表示需要根据鼠标位置居中渲染
            },
        ]
    }
 */
interface DataSchemaOptions {
    container: {
        width: number
        height: number
    }
    widgets: Widgets
}
class DataSchema {
    public container
    public widgets
    constructor(options?: DataSchemaOptions) {
        this.container = options?.container ?? {
            width: 500,
            height: 500,
        }
        this.widgets = options?.widgets ?? []
    }
}
export default DataSchema
