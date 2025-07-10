<script lang="ts">
    import { showMessage } from "siyuan";
    import SettingPanel from "./libs/components/setting-panel.svelte";

    let groups: string[] = ["🌈 Group 1", "✨ Group 2"];
    let focusGroup = groups[0];

    const group1Items: ISettingItem[] = [
        {
            type: 'checkbox',
            title: '复选框',
            description: '这是一个复选框',
            key: 'a',
            value: true
        },
        {
            type: 'textinput',
            title: '文本',
            description: '这是一个文本',
            key: 'b',
            value: '这是一个文本',
            placeholder: 'placeholder'
        },
        {
            type: 'textarea',
            title: '文本域',
            description: '这是一个文本域',
            key: 'b2',
            value: '这是一个文本域',
            placeholder: 'placeholder',
            direction: 'row'
        },
        {
            type: 'select',
            title: '下拉框',
            description: '这是一个下拉框',
            key: 'c',
            value: 'x',
            options: {
                x: 'x',
                y: 'y',
                z: 'z'
            }
        }
    ];

    const group2Items: ISettingItem[] = [
        {
            type: 'button',
            title: '按钮',
            description: '这是一个按钮',
            key: 'e',
            value: '点击按钮',
            button: {
                label: '点击我',
                callback: () => {
                    showMessage('Hello, world!');
                }
            }
        },
        {
            type: 'slider',
            title: '滑块',
            description: '这是一个滑块',
            key: 'd',
            value: 50,
            slider: {
                min: 0,
                max: 100,
                step: 1
            }
        }
    ];

    /********** Events **********/
    interface ChangeEvent {
        group: string;
        key: string;
        value: any;
    }

    const onChanged = ({ detail }: CustomEvent<ChangeEvent>) => {
        if (detail.group === groups[0]) {
            // setting.set(detail.key, detail.value);
            //Please add your code here
            //Udpate the plugins setting data, don't forget to call plugin.save() for data persistence
        }
    };
</script>

<div class="fn__flex-1 fn__flex config__panel">
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#each groups as group}
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li
                data-name="editor"
                class:b3-list-item--focus={group === focusGroup}
                class="b3-list-item"
                on:click={() => {
                    focusGroup = group;
                }}
                on:keydown={() => {}}
            >
                <span class="b3-list-item__text">{group}</span>
            </li>
        {/each}
    </ul>
    <div class="config__tab-wrap">
        <SettingPanel
            group={groups[0]}
            settingItems={group1Items}
            display={focusGroup === groups[0]}
            on:changed={onChanged}
            on:click={({ detail }) => { console.debug("Click:", detail.key); }}
        >
            <div class="fn__flex b3-label">
                💡 这是我们的默认设置。
            </div>
        </SettingPanel>
        <SettingPanel
            group={groups[1]}
            settingItems={group2Items}
            display={focusGroup === groups[1]}
            on:changed={onChanged}
            on:click={({ detail }) => { console.debug("Click:", detail.key); }}
        >
        </SettingPanel>
    </div>
</div>

<style lang="scss">
    .config__panel {
        height: 100%;
    }
    .config__panel > ul > li {
        padding-left: 1rem;
    }
</style>

