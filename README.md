# lowcode
项目目标是实现一个拖拉拽生成动态大屏的页面。组件库使用data-v。
## 开发环境
node : 20.6  
pnpm : 8.7.4
## 辅助线
以最后一个选中的widget为参考，如果选择多个然后有取消操作，也是根据选择的顺序来判断，以选中状态中最后一个选中的为基准。  
参考规则（前面的的是最后一个选择的元素）：
- 横向
  - 顶对顶
  - 中队中
  - 底对底
  - 顶对底
  - 底对顶
- 纵向
  - 右对左
  - 中对中
  - 左对右
  - 左对左
  - 右对右
现在这种是根据选择的顺序来处理的，后续可以优化为当拖动的时候鼠标选择的元素为基准，如果是shift取消直接拖动就按照选择的顺序取最后一个为基准进行计算。  
### 算法
- 获取其他没有选择的widget，以他们的位置为基准做辅助线。
- 每次拖动事件开始后的时候计算一次基准widget相对其他未选的widget的辅助线会出现的位置。
- 拖动过程根据当前拖动基准widget的位置计算，与那个最先距离小于5像素，生成辅助线
- 自动吸附到辅助线位置
- 添加相对于画布中间的辅助线

## 常规的操作功能
所有的方法全部封装在useCommands里面  
记录过程需要eventbus来派发事件，从而更新useCommands里面记录的操作记录  
监听拖动的开始和结束事件来存储数据  
```
const state = {
    current: -1, //指针索引
    queue: [] as QueueItem[], //存放所有的操作指令，利用闭包存储这对应操作时的前后数据
    commands: {} as Commands, //制作命令和执行功能一个映射表，用来调用事件，例如state.commands["drag"]()
    commandArray: [] as Command[], //存放所有命令，处理需要初始化，和键盘事件会用到
    destroyArray: [] as Array<() => void>, //存储这清除副作用的函数，如绑定的事件
}
```
通过register方法来注入命令，实际数据操作的方法就是在这处理