<template>
    <Page>
        <ActionBar title="To Do" />
        <GridLayout columns="*, auto" rows="auto, *" height="100%"
            width="100%">
            <TextField v-model="textFieldValue" hint="Enter text..." row="0"
                col="0" @returnPress="onButtonTap" ref="textField" />
            <Button text="Agregar" @tap="onButtonTap" row="0" col="2"
                class="-primary -rounded-sm" />

            <FlexboxLayout row="1" col="0" colSpan="2">
                <BottomNavigation>

                    <TabStrip>
                        <TabStripItem>
                            <Label text="To Do"></Label>
                            <Image :src="getIcon('0xf022')" class="far t-36">
                            </Image>
                        </TabStripItem>
                        <TabStripItem class="tab-strip-inProgress">
                            <Label text="In Progress"></Label>
                            <Image :src="getIcon('0xf017')" class="far t-36">
                            </Image>
                        </TabStripItem>
                        <TabStripItem class="tab-strip-finished">
                            <Label text="Finished"></Label>
                            <Image :src="getIcon('0xf14a')" class="far t-36">
                            </Image>
                        </TabStripItem>
                    </TabStrip>

                    <TabContentItem>
                        <ScrollView orientation="vertical" colSpan="2">
                            <ItemsListView 
                                :list="lists.todo"
                                @progress="toInProgress($event)"
                                @delete="deleteFromList($event)" />
                        </ScrollView>
                    </TabContentItem>
                    <TabContentItem>
                        <ScrollView orientation="vertical" colSpan="2">
                            <ItemsListView 
                                :list="lists.inProgress"
                                :buttonProgressIcon="String.fromCharCode(0xf058)"
                                @progress="toFinished($event)"
                                @delete="deleteFromList($event)" />
                        </ScrollView>
                    </TabContentItem>
                    <TabContentItem>
                        <ScrollView orientation="vertical" colSpan="2">
                            <ItemsListView 
                                :list="lists.finished"
                                :hasProgress="false"
                                @delete="deleteFromList($event.key, $event.list)" />
                        </ScrollView>
                    </TabContentItem>

                </BottomNavigation>
            </FlexboxLayout>

        </GridLayout>
    </Page>
</template>

<script>
    const appSettings = require("application-settings");
    const utilsModule = require("tns-core-modules/utils/utils");
    import ItemsListView from "./ItemsListView";

    export default {
        components: {
            ItemsListView
        },

        methods: {
            onButtonTap() {
                this.lists.todo.push(this.textFieldValue);
                utilsModule.ad.dismissSoftInput();
                this.textFieldValue = "";
            },
            deleteFromList({ key, list }) {
                list.splice(key, 1);
            },
            toInProgress({ key }) {
                const todoItem = this.lists.todo.splice(key, 1)[0];
                this.lists.inProgress.push(todoItem);
            },
            toFinished(key) {
                const todoItem = this.lists.inProgress.splice(key, 1)[0];
                this.lists.finished.push(todoItem);
            },
            getIcon(hex) {
                return `font://${String.fromCharCode(hex)}`;
            }
        },

        mounted() {
            if (appSettings.getString("lists")) {
                this.lists = JSON.parse(appSettings.getString("lists"));
            }
        },

        watch: {
            lists: {
                handler: (lists) => {
                    appSettings.setString("lists", JSON.stringify(lists));
                },
                deep: true
            }
        },

        data() {
            return {
                textFieldValue: "",
                lists: {
                    todo: [],
                    inProgress: [],
                    finished: []
                }
            };
        }
    };
</script>

<style>
    BottomNavigation .to-next-list {
        color: green;
    }

    BottomNavigation .delete-icon {
        color: red;
    }

    BottomNavigation button {
        font-size: 24px;
        width: 100%;
    }

    .tab-strip-inProgress:active {
        color: darkcyan;
    }

    .tab-strip-inProgress:active Label {
        color: darkcyan;
    }

    .tab-strip-finished:active {
        color: orange;
    }

    .tab-strip-finished:active Label {
        color: orange;
    }
</style>
