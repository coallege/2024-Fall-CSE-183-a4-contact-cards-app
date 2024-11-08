"use strict";

const app = Vue.createApp({});

app.component("contacts", {
    setup() {
        // :Cults:
        const contacts = Vue.ref([]);
        async function fetchData() {
            const {data} = await axios.get(contacts_url);
            contacts.value = data;
        }
        async function addContact() {
            const {data} = await axios.post(contacts_url);
            contacts.value.push({id: data});
        }
        async function editContact(c) {
            await axios.put(contacts_url, c);
            for (const curr of contacts.value) {
                if (curr.id === c.id) {
                    Object.assign(curr, c);
                    break;
                }
            }
        }
        async function deleteContact(id) {
            await axios.delete(`${contacts_url}?id=${id}`);
            contacts.value = contacts.value.filter(c => c.id !== id);
        }

        fetchData();

        /** @type {{value: HTMLInputElement}} */
        const fileInput = Vue.ref(null);
        /** @returns {Promise<string>} */
        function getImage() {
            return new Promise((res, rej) => {
                const fileSelected = () => {
                    fileInput.value.removeEventListener("change", fileSelected);
                    const files = fileInput.value.files;
                    if (files.length < 1) {
                        // not that this does anything since we're in a promise.
                        // actually maybe it does who cares.
                        throw new Error("You must select at least one file!");
                    }
                    const reader = new FileReader(files[0]);
                    reader.readAsDataURL(files[0]);
                    reader.onload = () => res(reader.result);
                    reader.onerror = rej;
                };
                fileInput.value.addEventListener("change", fileSelected);
                fileInput.value.click();
            });
        }

        return {
            contacts,
            addContact,
            editContact,
            deleteContact,
            fileInput,
            getImage,
        }
    },
    template: /* html */ `
        <input
            ref="fileInput"
            type="file"
            id="file-input"
            style="display: none"
            accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
        >
        <div class="container">
            <h1 class="title">Contacts</h1>
            <div>
                <button class="button is-success" id="add_button" @click="addContact">
                    Add Contact
                </button>
            </div>
            <template v-for="c in contacts" :key="c.id">
                <contact
                    :me="c"
                    :editContact="editContact"
                    :deleteContact="deleteContact"
                    :getImage="getImage"
                />
            </template>
        </div>
    `
});

app.component("contact", {
    props: ["me", "editContact", "deleteContact", "getImage"],
    setup(props) {
        function changeName(name) {
            props.me.name = name;
            props.editContact(props.me);
        }
        function changeCompany(company) {
            props.me.company = company;
            props.editContact(props.me);
        }
        function changeImage(img) {
            props.me.img = img;
            props.editContact(props.me);
        }
        function changeDesc(desc) {
            props.me.desc = desc;
            props.editContact(props.me);
        }
        return {
            changeName,
            changeCompany,
            changeImage,
            changeDesc,
        };
    },
    template: /* html */ `
        <div class="card contact mt-4">
            <div class="card-content">
                <div class="media">
                    <div class="media-left">
                        <contact-image
                            :src="me.img"
                            :getImage="getImage"
                            :change="changeImage"
                        />
                    </div>
                    <div class="media-content">
                        <p class="title person-name">
                            <editable-text
                                clazz="input is-4 title"
                                name="name"
                                placeholder="Name"
                                :value="me.name"
                                :change="changeName"
                            />
                        </p>
                        <p class="subtitle person-affiliation">
                            <editable-text
                                clazz="input is-6"
                                name="affiliation"
                                placeholder="Affiliation"
                                :value="me.company"
                                :change="changeCompany"
                            />
                        </p>
                    </div>
                    <div class="media-right">
                        <i
                            class="delete-button has-text-danger fa fa-trash trash"
                            @click="deleteContact(me.id)">
                        </i>
                    </div>
                </div>
                <teck-starea
                    :value="me.desc"
                    :change="changeDesc"
                />
            </div>
        </div>
    `,
})

app.component("editable-text", {
    props: ["clazz", "name", "placeholder", "value", "change"],
    setup(props) {
        const input = Vue.ref(null);
        const readonly = Vue.ref(true);
        const style = Vue.computed(() => {
            const bake = readonly.value && props.value;
            if (bake) {
                return {
                    border: "none",
                    padding: "0px",
                };
            } else {
                return {};
            }
        });
        function activate() {
            readonly.value = false;
            input.value.focus();
        }
        function commit() {
            readonly.value = true;
            props.change(input.value.value);
        }
        return {
            input,
            readonly,
            style,
            activate,
            commit,
        };
    },
    template: /* html */ `
        <input
            ref="input"
            :class="clazz"
            :name="name"
            :placeholder="placeholder"
            :value="value"
            :readonly="readonly"
            :style="style"
            @click="activate"
            @blur="commit"
        ></input>
    `,
});

app.component("contact-image", {
    props: ["src", "change", "getImage"],
    setup(props) {
        async function getAndChangeImage() {
            props.change(await props.getImage());
        }
        return {getAndChangeImage};
    },
    template: /* html */ `
        <figure class="photo image is-96x96" @click="getAndChangeImage">
            <img
                class="photo"
                :src="src || 'https://bulma.io/assets/images/placeholders/96x96.png'"
            />
        </figure>
    `,
});

app.component("teck-starea", {
    props: ["value", "change"],
    setup(props) {
        const el = Vue.ref(null);
        const readonly = Vue.ref(true);
        function activate() {
            readonly.value = false;
            el.value.focus();
        }
        function commit() {
            readonly.value = true;
            props.change(el.value.value);
        }
        return {
            el,
            readonly,
            activate,
            commit,
        }
    },
    template: /* html */ `
        <textarea
            ref="el"
            class="textarea"
            name="description"
            placeholder="Description"
            :value="value"
            :readonly="readonly"
            @click="activate"
            @blur="commit"
        ></textarea>
    `,
});

app.mount("#app");
