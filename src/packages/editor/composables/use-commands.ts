import { events } from "@/packages/eventbus"
import { cloneDeep } from "lodash-es"
import { onUnmounted, type WritableComputedRef } from "vue"
interface Commands {
    [key: string]: (t?: any) => void
}
interface QueueItem {
    redo: () => void
    undo: () => void
}
interface Command {
    name: string
    keyboard?: string
    pushQueue?: boolean
    init?: () => () => void
    before?: Widgets
    execute: (t?: any) => { [key: string]: (t?: any) => void }
}
export default function useCommand(data: WritableComputedRef<EditorData>) {
    const state = {
        current: -1, //前进后退索引
        queue: [] as QueueItem[], //存放所有的操作指令
        commands: {} as Commands, //制作命令和执行功能一个映射表
        commandArray: [] as Command[], //存放所有命令
        destroyArray: [] as Array<() => void>, //存储这清除副作用的函数
    }
    const register = (command: Command) => {
        state.commandArray.push(command)
        // 命令函数映射表 函数的形式方便扩展传参
        state.commands[command.name] = (t?: any) => {
            const { redo, undo } = command.execute(t)
            redo() //这个方法所有的指令都会有
            if (!command.pushQueue) {
                return
            }
            // 如果先放了 组建1 --> 组件2 -->撤回 -->组件3
            // 组件1 --> 组件3
            let { queue, current } = state
            if (queue.length > 0) {
                //  可能在放置的过程中有撤销操作，所以根据当前最新的current值来计算新的队列
                queue = queue.slice(0, current + 1)
                state.queue = queue
            }
            queue.push({ redo, undo }) // 保存指令的前进后退
            current = current + 1
            state.current = current
            console.log(queue)
        }
    }
    // 注册需要的命令
    register({
        name: "redo", //还原
        keyboard: "ctrl+y",
        execute() {
            //执行的方法
            return {
                redo() {
                    console.log("还原")
                    const item = state.queue[state.current + 1]
                    if (item) {
                        item.redo && item.redo()
                        state.current++
                    }
                    console.log(state.queue, state.current)
                },
            }
        },
    })
    register({
        name: "undo", //撤销
        keyboard: "ctrl+z",
        execute() {
            //执行的方法
            return {
                redo() {
                    console.log("撤销")
                    if (state.current == -1) return
                    const item = state.queue[state.current]
                    if (item) {
                        item.undo && item.undo()
                        state.current--
                    }
                    console.log(state.queue, state.current)
                },
            }
        },
    })
    //如果希望将操作放到队列中可以增加一个属性，标识当前操作需要存到队列中
    // 需要记录前后状态,也就是说这个指令得知道数据的变化，所以需要在初始化的时候就开始记录监听
    register({
        name: "drag",
        pushQueue: true,
        init() {
            // 监控拖拽开始事件，保存状态
            this.before
            // 监控拖拽开始事件，保存状态
            const start = () => {
                console.log("tuodong")
                this.before = cloneDeep(data.value.widgets)
            }
            // 拖拽之后需要出发对应指令
            const end = () => {
                state.commands["drag"]()
            }
            events.on("start", start)
            events.on("end", end)

            return () => {
                events.off("start", start)
                events.off("end", end)
            }
        },
        execute() {
            //执行的方法
            const before = this.before
            const after = JSON.stringify(data.value.widgets)
            return {
                redo() {
                    console.log("重做")
                    data.value.widgets = JSON.parse(after)
                    // data.value = { ...data.value, widgets: after }
                },
                undo() {
                    console.log("撤销")
                    if (before) data.value.widgets = before
                },
            }
        },
    })
    // 快捷键
    const keyboardEvent = (() => {
        const onKeydown = (event: KeyboardEvent) => {
            const { key, ctrlKey } = event
            const str: string[] = []
            if (ctrlKey) {
                str.push("ctrl")
            }
            str.push(key)
            const keyStr = str.join("+").toLocaleLowerCase()
            // 可以优化减少不必要的循环
            state.commandArray.forEach(({ keyboard, name }) => {
                if (!keyboard) return
                if (keyboard === keyStr) {
                    state.commands[name]()
                    event.preventDefault()
                }
            })
        }
        const init = () => {
            window.addEventListener("keydown", onKeydown)
            return () => {
                window.removeEventListener("keydown", onKeydown)
            }
        }
        return init
    })()
    // 初始化的时候执行对应的init方法
    ;(() => {
        // 将键盘时间的销毁时间加入
        state.destroyArray.push(keyboardEvent())
        state.commandArray.forEach(
            (command) =>
                command.init && state.destroyArray.push(command.init()),
        )
    })()
    // 卸载的时候清除
    onUnmounted(() => {
        state.destroyArray.forEach((fn) => fn && fn())
    })
    return state
}
