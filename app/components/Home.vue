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
                                :listName="listsConstants.TODO"
                                @progress="progressList({ key: $event.key, constantFrom: listsConstants.TODO, constantTo: listsConstants.IN_PROGRESS })"
                                @delete="deleteFromList($event)" />
                        </ScrollView>
                    </TabContentItem>
                    <TabContentItem>
                        <ScrollView orientation="vertical" colSpan="2">
                            <ItemsListView 
                                :list="lists.inProgress"
                                :listName="listsConstants.IN_PROGRESS"
                                :buttonProgressIcon="String.fromCharCode(0xf058)"
                                @progress="progressList({ key: $event.key, constantFrom: listsConstants.IN_PROGRESS, constantTo: listsConstants.FINISHED })"
                                @delete="deleteFromList($event)" />
                        </ScrollView>
                    </TabContentItem>
                    <TabContentItem>
                        <ScrollView orientation="vertical" colSpan="2">
                            <ItemsListView 
                                :list="lists.finished"
                                :listName="listsConstants.FINISHED"
                                :hasProgress="false"
                                @delete="deleteFromList($event)" />
                        </ScrollView>
                    </TabContentItem>

                </BottomNavigation>
            </FlexboxLayout>

        </GridLayout>
    </Page>
</template>

<script>
    const utilsModule = require("tns-core-modules/utils/utils");
    import ItemsListView from "./ItemsListView";

    export default {
        components: {
            ItemsListView
        },

        methods: {
            onButtonTap() {
                this.pushToList(this.listsConstants.TODO, this.textFieldValue);
                utilsModule.ad.dismissSoftInput();
                this.textFieldValue = "";
            },
            progressList({ key, constantFrom, constantTo }) {
                const todoItem = this.lists[constantFrom][key];
                this.pushToList(constantTo, todoItem).then(() => {
                    this.deleteFromList({
                        key,
                        list: this.lists[constantFrom],
                        listName: constantFrom
                    });
                });
            },
            getIcon(hex) {
                return `font://${String.fromCharCode(hex)}`;
            },

            // Firebase methods
            populateLists({ value }) {
                this.lists = value || {};
                [this.listsConstants.TODO, this.listsConstants.IN_PROGRESS, this.listsConstants.FINISHED]
                    .forEach((list) => {
                        if (!this.lists[list]) {
                            this.lists[list] = [];
                        }
                    });
            },
            pushToList(list, value) {
                return this.$firebase.push(
                    `/lists/${list}`,
                    value
                ).then(({ key }) => {
                    this.lists[list][key] = value;
                });
            },
            deleteFromList({ key, list, listName }) {
                const data = {
                    [key]: null
                };
                this.$firebase.update(
                    `/lists/${listName}`,
                    data
                ).then(() => {
                    delete list[key];
                });
            }
        },

        mounted() {
            let listeners;

            // Primera inicializacion
            this.$bus.$on("firebase:initialized", () => {
                this.$firebase.getValue("/lists").then(this.populateLists);
                this.$firebase.addValueEventListener(this.populateLists, "/lists").then((listenerWrapper) => {
                    listeners = listenerWrapper.listeners;
                });
            });

            // Segunda vez que se ejecuta mounted +
            if (!listeners) {
                this.$firebase.addValueEventListener(this.populateLists, "/lists");
            }
        },

        data() {
            return {
                listsConstants: {
                    TODO: "todo",
                    IN_PROGRESS: "inProgress",
                    FINISHED: "finished"
                },
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
