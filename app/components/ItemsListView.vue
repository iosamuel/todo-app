<template>
    <ListView for="(item, key) in list">
        <v-template>
            <GridLayout columns="*, 60, 60" rows="auto">
                <Label :text="item" class="t-12" row="0" col="0"
                    textWrap="true" />
                <Button v-if="hasProgress"
                    :text="buttonProgressIcon"
                    @tap="$emit('progress', { key })" row="0"
                    class="far to-next-list" col="1" />
                <Button :text="String.fromCharCode(0xf2ed)"
                    @tap="$emit('delete', { key, list })" row="0"
                    class="far delete-icon" col="2" />
            </GridLayout>
        </v-template>
    </ListView>
</template>

<script>
    export default {
        props: {
            list: Array,
            buttonProgressIcon: {
                type: String,
                default: String.fromCharCode(0xf152)
            },
            hasProgress: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {};
        }
    };
</script>
