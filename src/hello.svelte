<!--
 Copyright (c) 2024 by frostime. All Rights Reserved.
 Author       : frostime
 Date         : 2023-11-19 12:30:45
 FilePath     : /src/hello.svelte
 LastEditTime : 2024-10-16 14:37:50
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { version, sql as query } from "@/api";
    import { showMessage, fetchPost, Protyle } from "siyuan";

    export let app;

    let time: string = "";
    let ver: string = "";

    let divProtyle: HTMLDivElement;
    let protyle: any;
    let blockID: string = '';

    onMount(async () => {
        ver = await version();
        fetchPost("/api/system/currentTime", {}, (response) => {
            time = new Date(response.data).toString();
        });
        protyle = await initProtyle();
    });

    onDestroy(() => {
        showMessage("Hello panel closed");
        protyle.destroy();
    });

    async function initProtyle() {
        let sql = "SELECT * FROM blocks ORDER BY RANDOM () LIMIT 1;";
        let blocks: Block[] = await query(sql);
        blockID = blocks[0].id;
        return new Protyle(app, divProtyle, {
            blockId: blockID
        });
    }
</script>

<div class="b3-dialog__content">
    <div>appId:</div>
    <div class="fn__hr"></div>
    <div class="plugin-sample__time">${app?.appId}</div>
    <div class="fn__hr"></div>
    <div class="fn__hr"></div>
    <div>API 示例:</div>
    <div class="fn__hr" />
    <div class="plugin-sample__time">
        系统当前时间: <span id="time">{time}</span>
    </div>
    <div class="fn__hr" />
    <div class="fn__hr" />
    <div>Protyle 示例: id = {blockID}</div>
    <div class="fn__hr" />
    <div id="protyle" style="height: 360px;" bind:this={divProtyle}/>
</div>

