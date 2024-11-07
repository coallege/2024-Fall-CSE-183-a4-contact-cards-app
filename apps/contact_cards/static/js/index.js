"use strict";

const app = Vue.createApp({});

app.component("shopping-list", {
    setup() {
        const cart = Vue.ref([]);
        const lookup = Vue.computed(() => {
            const idToProduct = {};
            for (const p of cart.value) {
                idToProduct[p.id] = p;
            }
            return idToProduct;
        });
        const curryCheckChange = id => async event => {
            const {checked} = event.target;
            if (lookup.value[id].checked != checked) {
                await fetch(`${set_check_url}?id=${id}&checked=${checked}`);
                fetchData();
            }
        };
        const curryRemove = id => async () => {
            await fetch(`${remove_url}?id=${id}`);
            fetchData();
        }
        async function fetchData() {
            try {
                cart.value = await (await fetch(load_data_url)).json();
                console.log(cart.value);
            } catch (e) {
                // nothing
            }
        }
        fetchData();
        const addItemInput = Vue.ref(null);
        async function addItem() {
            const name = addItemInput.value.value;
            if (!name) {
                return;
            }
            await fetch(`${add_url}?name=${name}`);
            await fetchData();
            addItemInput.value.value = "";
        }
        return {
            cart,
            curryCheckChange,
            curryRemove,
            addItemInput,
            addItem,
        }
    },
    template: /* html */ `
        <table class="table is-fullwidth is-striped" id="table">
            <tr class="add-row">
                <td class="is-narrow" @click="addItem">
                    <i class="is-size-2 fa fa-plus-square has-text-success add-item"></i>
                </td>
                <td>
                    <input class="input add-item" type="text" name="new_item" ref="addItemInput">
                </td>
                <td class="is-narrow"></td>
            </tr>
            <template v-for="p in cart" :key="p.id">
                <product
                    :name="p.name"
                    :checked="p.checked"
                    :checkChange="curryCheckChange(p.id)"
                    :remove="curryRemove(p.id)"
                ></product>
            </template>
        </table>
    `
})

app.component("product", {
    props: ["name", "checked", "checkChange", "remove"],
    template: /* html */ `
        <tr class="item-row">
            <td class="check is-narrow">
                <input type="checkbox" :checked="checked" @change="checkChange">
            </td>
            <td class="item">{{name}}</td>
            <td class="trash is-narrow" @click="remove">
                <i class="trash has-text-danger fa fa-trash"></i>
            </td>
        </tr>
    `,
});

app.mount("#app");
