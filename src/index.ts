import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    openTab,
    adaptHotkey,
    getFrontend,
    getBackend,
    IModel,
    Protyle,
    openWindow,
    IOperation,
    Constants,
    openMobileFileById,
    lockScreen,
    ICard,
    ICardData,
    fetchPost
} from "siyuan";
import "@/index.scss";

// 引入HelloExample组件
import HelloExample from "@/hello.svelte";

// 引入自定义设置示例
import SettingExample from "@/setting-example.svelte";

import { SettingUtils } from "./libs/setting-utils";
import { svelteDialog } from "./libs/dialog";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";


// 插件类
export default class PluginSample extends Plugin {

    customTab: () => IModel;
    private isMobile: boolean;
    private blockIconEventBindThis = this.blockIconEvent.bind(this);
    private settingUtils: SettingUtils;

    // 插件加载
    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        console.log("加载插件中...", this.i18n);

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
<path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
</symbol>
<symbol id="iconSaving" viewBox="0 0 32 32">
<path d="M20 13.333c0-0.733 0.6-1.333 1.333-1.333s1.333 0.6 1.333 1.333c0 0.733-0.6 1.333-1.333 1.333s-1.333-0.6-1.333-1.333zM10.667 12h6.667v-2.667h-6.667v2.667zM29.333 10v9.293l-3.76 1.253-2.24 7.453h-7.333v-2.667h-2.667v2.667h-7.333c0 0-3.333-11.28-3.333-15.333s3.28-7.333 7.333-7.333h6.667c1.213-1.613 3.147-2.667 5.333-2.667 1.107 0 2 0.893 2 2 0 0.28-0.053 0.533-0.16 0.773-0.187 0.453-0.347 0.973-0.427 1.533l3.027 3.027h2.893zM26.667 12.667h-1.333l-4.667-4.667c0-0.867 0.12-1.72 0.347-2.547-1.293 0.333-2.347 1.293-2.787 2.547h-8.227c-2.573 0-4.667 2.093-4.667 4.667 0 2.507 1.627 8.867 2.68 12.667h2.653v-2.667h8v2.667h2.68l2.067-6.867 3.253-1.093v-4.707z"></path>
</symbol>`);

        // 添加顶部栏图标
        const topBarElement = this.addTopBar({
            icon: "iconFace",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                // 如果是在移动端，则添加菜单
                if (this.isMobile) {
                    this.addMenu();
                } else {
                    // rect 是顶部栏的矩形区域
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果顶部栏被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    // 如果更多按钮被隐藏，则使用插件按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }

                    // 添加菜单
                    this.addMenu(rect);
                }
            }
        });

        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="Remove plugin-sample Data">
    <svg>
        <use xlink:href="#iconTrashcan"></use>
    </svg>
</div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", () => {
            confirm("⚠️", this.i18n.confirmRemove.replace("${name}", this.name), () => {
                this.removeData(STORAGE_NAME).then(() => {
                    this.data[STORAGE_NAME] = { readonlyText: "Readonly" };
                    showMessage(`[${this.name}]: ${this.i18n.removedData}`);
                });
            });
        });

        // 添加状态栏
        this.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
        });

        // 添加命令
        this.addCommand({
            langKey: "showDialog",
            hotkey: "⇧⌘O",
            callback: () => {
                this.showDialog();
            },
            fileTreeCallback: (file: any) => {
                console.log(file, "fileTreeCallback");
            },
            editorCallback: (protyle: any) => {
                console.log(protyle, "editorCallback");
            },
            dockCallback: (element: HTMLElement) => {
                console.log(element, "dockCallback");
            },
        });

        // 添加命令
        this.addCommand({
            langKey: "getTab",
            hotkey: "⇧⌘M",
            globalCallback: () => {
                console.log(this.getOpenedTab());
            },
        });

        // 添加浮动窗口
        this.addDock({
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconSaving",
                title: "Custom Dock",
                hotkey: "⌥⌘W",
            },
            data: {
                text: "This is my custom dock"
            },
            type: DOCK_TYPE,
            resize() {
                console.log(DOCK_TYPE + " resize");
            },
            update() {
                console.log(DOCK_TYPE + " update");
            },
            init: (dock) => {
                if (this.isMobile) {
                    dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                    <svg class="toolbar__icon"><use xlink:href="#iconEmoji"></use></svg>
                        <div class="toolbar__text">Custom Dock</div>
                    </div>
                    <div class="fn__flex-1 plugin-sample__custom-dock">
                        ${dock.data.text}
                    </div>
                    </div>`;
                } else {
                    dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                    <div class="block__icons">
                        <div class="block__logo">
                            <svg class="block__logoicon"><use xlink:href="#iconEmoji"></use></svg>
                            Custom Dock
                        </div>
                        <span class="fn__flex-1 fn__space"></span>
                        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg class="block__logoicon"><use xlink:href="#iconMin"></use></svg></span>
                    </div>
                    <div class="fn__flex-1 plugin-sample__custom-dock">
                        ${dock.data.text}
                    </div>
                    </div>`;
                }
            },
            destroy() {
                console.log("destroy dock:", DOCK_TYPE);
            }
        });
        /* 
                // 添加设置
                this.settingUtils = new SettingUtils({
                    plugin: this, name: STORAGE_NAME
                });
        
                // 添加设置项
                this.settingUtils.addItem({
                    key: "Input",
                    value: "",
                    type: "textinput",
                    title: "只读文本",
                    description: "输入描述",
                    action: {
                        // Called when focus is lost and content changes
                        callback: () => {
                            // Return data and save it in real time
                            let value = this.settingUtils.takeAndSave("Input");
                            console.log(value);
                        }
                    }
                });
                this.settingUtils.addItem({
                    key: "InputArea",
                    value: "",
                    type: "textarea",
                    title: "只读文本",
                    description: "输入描述",
                    // Called when focus is lost and content changes
                    action: {
                        callback: () => {
                            // Read data in real time
                            let value = this.settingUtils.take("InputArea");
                            console.log(value);
                        }
                    }
                });
                this.settingUtils.addItem({
                    key: "Check",
                    value: true,
                    type: "checkbox",
                    title: "复选框",
                    description: "复选框描述",
                    action: {
                        callback: () => {
                            // Return data and save it in real time
                            let value = !this.settingUtils.get("Check");
                            this.settingUtils.set("Check", value);
                            console.log(value);
                        }
                    }
                });
                this.settingUtils.addItem({
                    key: "Select",
                    value: 1,
                    type: "select",
                    title: "下拉框",
                    description: "下拉框描述",
                    options: {
                        1: "Option 1",
                        2: "Option 2"
                    },
                    action: {
                        callback: () => {
                            // Read data in real time
                            let value = this.settingUtils.take("Select");
                            console.log(value);
                        }
                    }
                });
                this.settingUtils.addItem({
                    key: "Slider",
                    value: 50,
                    type: "slider",
                    title: "滑块",
                    description: "滑块描述",
                    direction: "column",
                    slider: {
                        min: 0,
                        max: 100,
                        step: 1,
                    },
                    action: {
                        callback: () => {
                            // Read data in real time
                            let value = this.settingUtils.take("Slider");
                            console.log(value);
                        }
                    }
                });
                this.settingUtils.addItem({
                    key: "Btn",
                    value: "",
                    type: "button",
                    title: "按钮",
                    description: "按钮描述",
                    button: {
                        label: "Button",
                        callback: () => {
                            showMessage("Button clicked");
                        }
                    }
                });
                this.settingUtils.addItem({
                    key: "Custom Element",
                    value: "",
                    type: "custom",
                    direction: "row",
                    title: "自定义元素",
                    description: "自定义元素描述",
                    //Any custom element must offer the following methods
                    createElement: (currentVal: any) => {
                        let div = document.createElement('div');
                        div.style.border = "1px solid var(--b3-theme-primary)";
                        div.contentEditable = "true";
                        div.textContent = currentVal;
                        return div;
                    },
                    getEleVal: (ele: HTMLElement) => {
                        return ele.textContent;
                    },
                    setEleVal: (ele: HTMLElement, val: any) => {
                        ele.textContent = val;
                    }
                });
                this.settingUtils.addItem({
                    key: "Hint",
                    value: "",
                    type: "hint",
                    title: this.i18n.hintTitle,
                    description: this.i18n.hintDesc,
                }); */

        // 加载设置
        try {
            this.settingUtils.load();
        } catch (error) {
            console.error("加载设置失败, 可能是空配置json:", error);
        }

        // 添加protyle斜杠
        this.protyleSlash = [{
            filter: ["insert emoji 😊", "插入表情 😊", "crbqwx"],
            html: `<div class="b3-list-item__first"><span class="b3-list-item__text">${this.i18n.insertEmoji}</span><span class="b3-list-item__meta">😊</span></div>`,
            id: "insertEmoji",
            callback(protyle: Protyle) {
                protyle.insert("😊");
            }
        }];

        this.protyleOptions = {
            toolbar: ["block-ref",
                "a",
                "|",
                "text",
                "strong",
                "em",
                "u",
                "s",
                "mark",
                "sup",
                "sub",
                "clear",
                "|",
                "code",
                "kbd",
                "tag",
                "inline-math",
                "inline-memo",
                "|",
                {
                    name: "insert-smail-emoji",
                    icon: "iconEmoji",
                    hotkey: "⇧⌘I",
                    tipPosition: "n",
                    tip: this.i18n.insertEmoji,
                    click(protyle: Protyle) {
                        protyle.insert("😊");
                    }
                }],
        };

        console.log(this.i18n.helloPlugin);
    }

    // 布局准备
    onLayoutReady() {
        // this.loadData(STORAGE_NAME);
        this.settingUtils.load();
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);

        console.log(
            "Official settings value calling example:\n" +
            this.settingUtils.get("InputArea") + "\n" +
            this.settingUtils.get("Slider") + "\n" +
            this.settingUtils.get("Select") + "\n"
        );

        let tabDiv = document.createElement("div");
        // 创建HelloExample组件
        new HelloExample({
            target: tabDiv,
            props: {
                app: this.app,
            }
        });
        this.customTab = this.addTab({
            type: TAB_TYPE,
            init() {
                this.element.appendChild(tabDiv);
                console.log(this.element);
            },
            beforeDestroy() {
                console.log("销毁标签页:", TAB_TYPE);
            },
            destroy() {
                console.log("销毁标签页:", TAB_TYPE);
            }
        });
    }

    // 卸载
    async onunload() {
        console.log(this.i18n.byePlugin);
        showMessage("再见, SiYuan 插件");
        console.log("卸载");
    }

    // 卸载
    uninstall() {
        console.log("卸载");
    }

    async updateCards(options: ICardData) {
        options.cards.sort((a: ICard, b: ICard) => {
            if (a.blockID < b.blockID) {
                return -1;
            }
            if (a.blockID > b.blockID) {
                return 1;
            }
            return 0;
        });
        return options;
    }

    /**
     * A custom setting pannel provided by svelte
     */
    openDIYSetting(): void {
        let dialog = new Dialog({
            title: "自定义设置面板",
            content: `<div id="SettingPanel" style="height: 100%;"></div>`,
            width: "800px",
            destroyCallback: (options) => {
                console.log("销毁回调", options);
                //You'd better destroy the component when the dialog is closed
                pannel.$destroy();
            }
        });
        let pannel = new SettingExample({
            target: dialog.element.querySelector("#SettingPanel"),
        });
    }

    // 事件总线粘贴
    private eventBusPaste(event: any) {
        // 如果需异步处理请调用 preventDefault， 否则会进行默认处理
        event.preventDefault();
        // 如果使用了 preventDefault，必须调用 resolve，否则程序会卡死
        event.detail.resolve({
            textPlain: event.detail.textPlain.trim(),
        });
    }

    // 事件总线日志
    private eventBusLog({ detail }: any) {
        console.log(detail);
    }

    // 添加块图标事件
    private blockIconEvent({ detail }: any) {
        detail.menu.addItem({
            iconHTML: "",
            label: this.i18n.removeSpace,
            click: () => {
                const doOperations: IOperation[] = [];
                detail.blockElements.forEach((item: HTMLElement) => {
                    const editElement = item.querySelector('[contenteditable="true"]');
                    if (editElement) {
                        editElement.textContent = editElement.textContent.replace(/ /g, "");
                        doOperations.push({
                            id: item.dataset.nodeId,
                            data: item.outerHTML,
                            action: "update"
                        });
                    }
                });
                detail.protyle.getInstance().transaction(doOperations);
            }
        });
    }

    // 显示对话框
    private showDialog() {
        // let dialog = new Dialog({
        //     title: `SiYuan ${Constants.SIYUAN_VERSION}`,
        //     content: `<div id="helloPanel" class="b3-dialog__content"></div>`,
        //     width: this.isMobile ? "92vw" : "720px",
        //     destroyCallback() {
        //         // hello.$destroy();
        //     },
        // });
        // new HelloExample({
        //     target: dialog.element.querySelector("#helloPanel"),
        //     props: {
        //         app: this.app,
        //     }
        // });
        svelteDialog({
            title: `SiYuan ${Constants.SIYUAN_VERSION}`,
            width: this.isMobile ? "92vw" : "720px",
            constructor: (container: HTMLElement) => {
                return new HelloExample({
                    target: container,
                    props: {
                        app: this.app,
                    }
                });
            }
        });
    }

    // 添加顶部栏菜单
    private addMenu(rect?: DOMRect) {
        const menu = new Menu("topBarSample", () => {
            console.log(this.i18n.byeMenu);
        });
        menu.addItem({
            icon: "iconInfo",
            label: "Dialog(打开帮助)",
            accelerator: this.commands[0].customHotkey,
            click: () => {
                this.showDialog();
            }
        });

        /* 
        // 如果是在桌面端，则添加菜单
        if (!this.isMobile) {
            menu.addItem({
                icon: "iconFace",
                label: "Open Custom Tab",
                click: () => {
                    const tab = openTab({
                        app: this.app,
                        custom: {
                            icon: "iconFace",
                            title: "Custom Tab",
                            data: {
                                text: "This is my custom tab",
                            },
                            id: this.name + TAB_TYPE
                        },
                    });
                    console.log(tab);
                }
            });
            menu.addItem({
                icon: "iconImage",
                label: "Open Asset Tab(open help first)",
                click: () => {
                    const tab = openTab({
                        app: this.app,
                        asset: {
                            path: "assets/paragraph-20210512165953-ag1nib4.svg"
                        }
                    });
                    console.log(tab);
                }
            });
            menu.addItem({
                icon: "iconFile",
                label: "Open Doc Tab(open help first)",
                click: async () => {
                    const tab = await openTab({
                        app: this.app,
                        doc: {
                            id: "20200812220555-lj3enxa",
                        }
                    });
                    console.log(tab);
                }
            });
            menu.addItem({
                icon: "iconSearch",
                label: "Open Search Tab",
                click: () => {
                    const tab = openTab({
                        app: this.app,
                        search: {
                            k: "SiYuan"
                        }
                    });
                    console.log(tab);
                }
            });
            menu.addItem({
                icon: "iconRiffCard",
                label: "Open Card Tab",
                click: () => {
                    const tab = openTab({
                        app: this.app,
                        card: {
                            type: "all"
                        }
                    });
                    console.log(tab);
                }
            });
            menu.addItem({
                icon: "iconLayout",
                label: "Open Float Layer(open help first)",
                click: () => {
                    this.addFloatLayer({
                        ids: ["20210428212840-8rqwn5o", "20201225220955-l154bn4"],
                        defIds: ["20230415111858-vgohvf3", "20200813131152-0wk5akh"],
                        x: window.innerWidth - 768 - 120,
                        y: 32
                    });
                }
            });
            menu.addItem({
                icon: "iconOpenWindow",
                label: "Open Doc Window(open help first)",
                click: () => {
                    openWindow({
                        doc: {id: "20200812220555-lj3enxa"}
                    });
                }
            });
        } else {
            // 如果是在移动端，则添加菜单
            menu.addItem({
                icon: "iconFile",
                label: "Open Doc(open help first)",
                click: () => {
                    openMobileFileById(this.app, "20200812220555-lj3enxa");
                }
            });
        } */

        /*  // 添加锁定屏幕菜单
         menu.addItem({
             icon: "iconLock",
             label: "Lockscreen",
             click: () => {
                 lockScreen(this.app);
             }
         }); */

        // 添加事件总线菜单
        menu.addItem({
            icon: "iconScrollHoriz",
            label: "测试事件",
            // 二级菜单
            type: "submenu",

            // 添加事件总线菜单 子菜单
            submenu: [{
                icon: "iconSelect",
                label: "获取当前时间",
                click: () => {

                    fetchPost("/api/system/currentTime", {}, (response) => {
                        showMessage(new Date(response.data).toString());
                    });
                }
            },{
                icon: "iconClose",
                label: "Off ws-main",
                click: () => {
                    this.eventBus.off("ws-main", this.eventBusLog);
                }
            },
            /*  {
                icon: "iconSelect",
                label: "On click-blockicon",
                click: () => {
                    this.eventBus.on("click-blockicon", this.blockIconEventBindThis);
                }
            }, {
                icon: "iconClose",
                label: "Off click-blockicon",
                click: () => {
                    this.eventBus.off("click-blockicon", this.blockIconEventBindThis);
                }
            }, {
                icon: "iconSelect",
                label: "On click-pdf",
                click: () => {
                    this.eventBus.on("click-pdf", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off click-pdf",
                click: () => {
                    this.eventBus.off("click-pdf", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On click-editorcontent",
                click: () => {
                    this.eventBus.on("click-editorcontent", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off click-editorcontent",
                click: () => {
                    this.eventBus.off("click-editorcontent", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On click-editortitleicon",
                click: () => {
                    this.eventBus.on("click-editortitleicon", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off click-editortitleicon",
                click: () => {
                    this.eventBus.off("click-editortitleicon", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On click-flashcard-action",
                click: () => {
                    this.eventBus.on("click-flashcard-action", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off click-flashcard-action",
                click: () => {
                    this.eventBus.off("click-flashcard-action", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-noneditableblock",
                click: () => {
                    this.eventBus.on("open-noneditableblock", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-noneditableblock",
                click: () => {
                    this.eventBus.off("open-noneditableblock", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On loaded-protyle-static",
                click: () => {
                    this.eventBus.on("loaded-protyle-static", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off loaded-protyle-static",
                click: () => {
                    this.eventBus.off("loaded-protyle-static", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On loaded-protyle-dynamic",
                click: () => {
                    this.eventBus.on("loaded-protyle-dynamic", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off loaded-protyle-dynamic",
                click: () => {
                    this.eventBus.off("loaded-protyle-dynamic", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On switch-protyle",
                click: () => {
                    this.eventBus.on("switch-protyle", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off switch-protyle",
                click: () => {
                    this.eventBus.off("switch-protyle", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On destroy-protyle",
                click: () => {
                    this.eventBus.on("destroy-protyle", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off destroy-protyle",
                click: () => {
                    this.eventBus.off("destroy-protyle", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-doctree",
                click: () => {
                    this.eventBus.on("open-menu-doctree", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-doctree",
                click: () => {
                    this.eventBus.off("open-menu-doctree", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-blockref",
                click: () => {
                    this.eventBus.on("open-menu-blockref", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-blockref",
                click: () => {
                    this.eventBus.off("open-menu-blockref", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-fileannotationref",
                click: () => {
                    this.eventBus.on("open-menu-fileannotationref", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-fileannotationref",
                click: () => {
                    this.eventBus.off("open-menu-fileannotationref", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-tag",
                click: () => {
                    this.eventBus.on("open-menu-tag", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-tag",
                click: () => {
                    this.eventBus.off("open-menu-tag", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-link",
                click: () => {
                    this.eventBus.on("open-menu-link", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-link",
                click: () => {
                    this.eventBus.off("open-menu-link", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-image",
                click: () => {
                    this.eventBus.on("open-menu-image", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-image",
                click: () => {
                    this.eventBus.off("open-menu-image", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-av",
                click: () => {
                    this.eventBus.on("open-menu-av", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-av",
                click: () => {
                    this.eventBus.off("open-menu-av", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-content",
                click: () => {
                    this.eventBus.on("open-menu-content", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-content",
                click: () => {
                    this.eventBus.off("open-menu-content", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-breadcrumbmore",
                click: () => {
                    this.eventBus.on("open-menu-breadcrumbmore", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-breadcrumbmore",
                click: () => {
                    this.eventBus.off("open-menu-breadcrumbmore", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-menu-inbox",
                click: () => {
                    this.eventBus.on("open-menu-inbox", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-menu-inbox",
                click: () => {
                    this.eventBus.off("open-menu-inbox", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On input-search",
                click: () => {
                    this.eventBus.on("input-search", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off input-search",
                click: () => {
                    this.eventBus.off("input-search", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On paste",
                click: () => {
                    this.eventBus.on("paste", this.eventBusPaste);
                }
            }, {
                icon: "iconClose",
                label: "Off paste",
                click: () => {
                    this.eventBus.off("paste", this.eventBusPaste);
                }
            }, {
                icon: "iconSelect",
                label: "On open-siyuan-url-plugin",
                click: () => {
                    this.eventBus.on("open-siyuan-url-plugin", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-siyuan-url-plugin",
                click: () => {
                    this.eventBus.off("open-siyuan-url-plugin", this.eventBusLog);
                }
            }, {
                icon: "iconSelect",
                label: "On open-siyuan-url-block",
                click: () => {
                    this.eventBus.on("open-siyuan-url-block", this.eventBusLog);
                }
            }, {
                icon: "iconClose",
                label: "Off open-siyuan-url-block",
                click: () => {
                    this.eventBus.off("open-siyuan-url-block", this.eventBusLog);
                }
            } */]
        });

        // 添加分界线
        menu.addSeparator();

        // 添加官方设置菜单
        menu.addItem({
            icon: "iconSettings",
            label: "官方设置",
            click: () => {
                showMessage("点击了官方设置");
                // this.openSetting();
            }
        });

        // 添加自定义设置菜单
        menu.addItem({
            icon: "iconSettings",
            label: "自定义设置",
            click: () => {
                this.openDIYSetting();
            }
        });

        // 添加只读菜单
        menu.addItem({
            icon: "iconSparkles",
            label: this.data[STORAGE_NAME].readonlyText || "@bluer  v1.0.0",
            type: "readonly",
        });

        // 添加全屏菜单
        if (this.isMobile) {
            menu.fullscreen();
        } else {
            // 如果是在桌面端，则添加菜单
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }
}
