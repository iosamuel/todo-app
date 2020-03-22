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
                                @progress="progressList({ ...$event, constantFrom: listsConstants.TODO, constantTo: listsConstants.IN_PROGRESS })"
                                @delete="deleteFromList($event)" />
                        </ScrollView>
                    </TabContentItem>
                    <TabContentItem>
                        <ScrollView orientation="vertical" colSpan="2">
                            <ItemsListView 
                                :list="lists.inProgress"
                                :listName="listsConstants.IN_PROGRESS"
                                :buttonProgressIcon="String.fromCharCode(0xf058)"
                                @progress="progressList({ ...$event, constantFrom: listsConstants.IN_PROGRESS, constantTo: listsConstants.FINISHED })"
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
            progressList({ key, index, constantFrom, constantTo }) {
                const { value } = this.lists[constantFrom][index];
                this.pushToList(constantTo, value).then(() => {
                    this.deleteFromList({
                        key,
                        index,
                        list: this.lists[constantFrom],
                        listName: constantFrom
                    });
                });
            },
            getIcon(hex) {
                return `font://${String.fromCharCode(hex)}`;
            },

            // Firebase methods
            populateLists() {
                [this.listsConstants.TODO, this.listsConstants.IN_PROGRESS, this.listsConstants.FINISHED]
                    .forEach((list) => {
                        this.$firebase.query(({ key, value, type }) => {
                            if (type !== "ChildRemoved") {
                                if (!this.lists[list]) {
                                    this.lists[list] = [];
                                } else {
                                    this.lists[list].push({ key, value: value.value });
                                }
                            }
                        }, `/lists/${list}`, {
                            orderBy: {
                                type: this.$firebase.QueryOrderByType.CHILD,
                                value: 'inserted',
                            }
                        });
                    });
            },
            pushToList(list, value) {
                const time = new Date();
                const data = {
                    value,
                    inserted: time.getTime()
                };
                return this.$firebase.push(
                    `/lists/${list}`,
                    data
                ).then(({ key }) => {
                    this.lists[list][key] = data;
                });
            },
            deleteFromList({ key, index, list, listName }) {
                const data = {
                    [key]: null
                };
                this.$firebase.update(
                    `/lists/${listName}`,
                    data
                ).then(() => {
                    list.splice(index, 1);
                });
            }
        },

        mounted() {
            // Primera inicializacion
            this.$bus.$on("firebase:initialized", () => {
                this.populateLists();
            });

            // Segunda vez que se ejecuta mounted +
            // TODO: verificar si existe el query
            this.populateLists();
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
